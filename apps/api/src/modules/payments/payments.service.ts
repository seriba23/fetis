import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { from?: string; to?: string; clientId?: string; quoteId?: string }) {
    const where: Prisma.PaymentWhereInput = {};
    if (filters.from || filters.to) {
      where.paidAt = {};
      if (filters.from) where.paidAt.gte = new Date(filters.from);
      if (filters.to) where.paidAt.lte = new Date(filters.to);
    }
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.quoteId) where.quoteId = filters.quoteId;

    return this.prisma.payment.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        quote: { select: { id: true, number: true } },
        registeredBy: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { client: true, quote: { include: { items: false } } },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async create(dto: CreatePaymentDto, userId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    if (dto.quoteId) {
      const quote = await this.prisma.quote.findUnique({ where: { id: dto.quoteId } });
      if (!quote) throw new NotFoundException('Cotización no encontrada');
    }

    const created = await this.prisma.payment.create({
      data: {
        clientId: dto.clientId,
        quoteId: dto.quoteId ?? null,
        registeredById: userId,
        amount: new Prisma.Decimal(dto.amount),
        method: dto.method,
        status: dto.status ?? 'COMPLETED',
        concept: dto.concept ?? 'DEPOSIT',
        reference: dto.reference ?? null,
        receiptUrl: dto.receiptUrl ?? null,
        paidAt: new Date(dto.paidAt),
        notes: dto.notes ?? null,
      },
      include: { client: true, quote: { select: { id: true, number: true } } },
    });

    if (dto.quoteId) {
      await this.refreshQuotePaidAmount(dto.quoteId);
    }
    return created;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const current = await this.findOne(id);
    const data: any = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.method !== undefined) data.method = dto.method;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.concept !== undefined) data.concept = dto.concept;
    if (dto.reference !== undefined) data.reference = dto.reference;
    if (dto.receiptUrl !== undefined) data.receiptUrl = dto.receiptUrl;
    if (dto.paidAt !== undefined) data.paidAt = new Date(dto.paidAt);
    if (dto.notes !== undefined) data.notes = dto.notes;
    const updated = await this.prisma.payment.update({
      where: { id },
      data,
      include: { client: true, quote: { select: { id: true, number: true } } },
    });
    if (current.quoteId) await this.refreshQuotePaidAmount(current.quoteId);
    return updated;
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });
    if (current.quoteId) await this.refreshQuotePaidAmount(current.quoteId);
    return { ok: true };
  }

  private async refreshQuotePaidAmount(quoteId: string) {
    const sum = await this.prisma.payment.aggregate({
      where: { quoteId, status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const total = Number(sum._sum.amount ?? 0);
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: { paidAmount: new Prisma.Decimal(total) },
    });
  }
}
