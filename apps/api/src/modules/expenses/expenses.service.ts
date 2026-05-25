import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { generateOccurrences, VirtualOccurrence } from './recurrence.util';

export interface ExpenseListItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  paidAt: string | null;
  status: string;
  payee: string | null;
  notes: string | null;
  templateId: string | null;
  virtual?: boolean;
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve gastos materializados + ocurrencias virtuales de plantillas
   * que aún no se han materializado en el rango solicitado.
   */
  async findAll(filters: { from?: string; to?: string; category?: string; status?: string; includeVirtual?: boolean }): Promise<ExpenseListItem[]> {
    const includeVirtual = filters.includeVirtual !== false;
    const fromDate = filters.from ? new Date(filters.from) : dayjs().subtract(1, 'month').toDate();
    const toDate = filters.to ? new Date(filters.to) : dayjs().add(2, 'month').toDate();

    const where: Prisma.ExpenseWhereInput = {
      date: { gte: fromDate, lte: toDate },
    };
    if (filters.category) where.category = filters.category as any;
    if (filters.status) where.status = filters.status as any;

    const materialized = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const result: ExpenseListItem[] = materialized.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      amount: Number(e.amount),
      date: e.date.toISOString(),
      paidAt: e.paidAt?.toISOString() ?? null,
      status: e.status,
      payee: e.payee,
      notes: e.notes,
      templateId: e.templateId,
    }));

    if (includeVirtual) {
      const templates = await this.prisma.expenseTemplate.findMany({ where: { active: true } });
      const materializedSet = new Set(materialized.filter((m) => m.templateId).map((m) => `${m.templateId}|${dayjs(m.date).format('YYYY-MM-DD')}`));

      for (const tpl of templates) {
        if (filters.category && tpl.category !== filters.category) continue;
        const occs = generateOccurrences(tpl, fromDate, toDate);
        for (const occ of occs) {
          const key = `${tpl.id}|${dayjs(occ.date).format('YYYY-MM-DD')}`;
          if (materializedSet.has(key)) continue;
          if (filters.status && filters.status !== 'PENDING') continue;
          result.push({
            id: `virtual:${tpl.id}:${dayjs(occ.date).format('YYYY-MM-DD')}`,
            name: tpl.name,
            category: tpl.category,
            amount: Number(tpl.amount),
            date: occ.date.toISOString(),
            paidAt: null,
            status: dayjs(occ.date).isBefore(dayjs(), 'day') ? 'OVERDUE' : 'PENDING',
            payee: tpl.payee,
            notes: tpl.notes,
            templateId: tpl.id,
            virtual: true,
          });
        }
      }
    }

    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { template: true, registeredBy: { select: { id: true, name: true } } },
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    return expense;
  }

  create(dto: CreateExpenseDto, userId: string) {
    return this.prisma.expense.create({
      data: {
        name: dto.name,
        category: dto.category,
        amount: new Prisma.Decimal(dto.amount),
        date: new Date(dto.date),
        status: dto.status ?? 'PENDING',
        payee: dto.payee ?? null,
        method: dto.method ?? null,
        reference: dto.reference ?? null,
        receiptUrl: dto.receiptUrl ?? null,
        notes: dto.notes ?? null,
        templateId: dto.templateId ?? null,
        registeredById: userId,
        paidAt: dto.status === 'PAID' && dto.paidAt ? new Date(dto.paidAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'PAID' && !dto.paidAt) data.paidAt = new Date();
      if (dto.status !== 'PAID') data.paidAt = null;
    }
    if (dto.paidAt !== undefined) data.paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
    if (dto.payee !== undefined) data.payee = dto.payee;
    if (dto.method !== undefined) data.method = dto.method;
    if (dto.reference !== undefined) data.reference = dto.reference;
    if (dto.receiptUrl !== undefined) data.receiptUrl = dto.receiptUrl;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return this.prisma.expense.update({ where: { id }, data });
  }

  async markPaid(id: string, paidAt?: string) {
    if (id.startsWith('virtual:')) {
      return this.materializeVirtual(id, true, paidAt);
    }
    await this.findOne(id);
    return this.prisma.expense.update({
      where: { id },
      data: { status: 'PAID', paidAt: paidAt ? new Date(paidAt) : new Date() },
    });
  }

  async remove(id: string) {
    if (id.startsWith('virtual:')) {
      throw new NotFoundException('No se puede eliminar una ocurrencia virtual. Desactiva la plantilla.');
    }
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return { ok: true };
  }

  /**
   * Materializa una ocurrencia virtual: id formato "virtual:<templateId>:<yyyy-mm-dd>"
   */
  async materializeVirtual(virtualId: string, markPaid: boolean, paidAt?: string) {
    const [, templateId, dateStr] = virtualId.split(':');
    if (!templateId || !dateStr) throw new NotFoundException('Virtual id inválido');
    const tpl = await this.prisma.expenseTemplate.findUnique({ where: { id: templateId } });
    if (!tpl) throw new NotFoundException('Plantilla no encontrada');
    const date = new Date(`${dateStr}T12:00:00.000Z`);
    return this.prisma.expense.create({
      data: {
        name: tpl.name,
        category: tpl.category,
        amount: tpl.amount,
        date,
        status: markPaid ? 'PAID' : 'PENDING',
        paidAt: markPaid ? (paidAt ? new Date(paidAt) : new Date()) : null,
        payee: tpl.payee,
        notes: tpl.notes,
        templateId: tpl.id,
      },
    });
  }

  // Resumen económico mensual para dashboard
  async getMonthlySummary(year: number, month: number) {
    const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
    const end = dayjs(start).endOf('month').toDate();
    const expensesPaid = await this.prisma.expense.aggregate({
      where: { paidAt: { gte: start, lte: end }, status: 'PAID' },
      _sum: { amount: true },
    });
    const expensesPending = await this.prisma.expense.aggregate({
      where: { date: { gte: start, lte: end }, status: { in: ['PENDING', 'OVERDUE'] } },
      _sum: { amount: true },
    });
    return {
      paid: Number(expensesPaid._sum.amount ?? 0),
      pending: Number(expensesPending._sum.amount ?? 0),
    };
  }
}
