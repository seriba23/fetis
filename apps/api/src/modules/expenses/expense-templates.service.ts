import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateExpenseTemplateDto } from './dto/create-expense-template.dto';
import { UpdateExpenseTemplateDto } from './dto/update-expense-template.dto';

@Injectable()
export class ExpenseTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(onlyActive = false) {
    return this.prisma.expenseTemplate.findMany({
      where: onlyActive ? { active: true } : {},
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tpl = await this.prisma.expenseTemplate.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Plantilla no encontrada');
    return tpl;
  }

  create(dto: CreateExpenseTemplateDto) {
    return this.prisma.expenseTemplate.create({
      data: {
        name: dto.name,
        category: dto.category,
        amount: new Prisma.Decimal(dto.amount),
        frequency: dto.frequency,
        dayOfMonth: dto.dayOfMonth ?? null,
        dayOfWeek: dto.dayOfWeek ?? null,
        monthOfYear: dto.monthOfYear ?? null,
        payee: dto.payee ?? null,
        notes: dto.notes ?? null,
        startsOn: new Date(dto.startsOn),
        endsOn: dto.endsOn ? new Date(dto.endsOn) : null,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateExpenseTemplateDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.dayOfMonth !== undefined) data.dayOfMonth = dto.dayOfMonth;
    if (dto.dayOfWeek !== undefined) data.dayOfWeek = dto.dayOfWeek;
    if (dto.monthOfYear !== undefined) data.monthOfYear = dto.monthOfYear;
    if (dto.payee !== undefined) data.payee = dto.payee;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.startsOn !== undefined) data.startsOn = new Date(dto.startsOn);
    if (dto.endsOn !== undefined) data.endsOn = dto.endsOn ? new Date(dto.endsOn) : null;
    if (dto.active !== undefined) data.active = dto.active;
    return this.prisma.expenseTemplate.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expenseTemplate.update({ where: { id }, data: { active: false } });
    return { ok: true };
  }
}
