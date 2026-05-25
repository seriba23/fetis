import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { status?: string; clientId?: string; search?: string }) {
    const where: Prisma.QuoteWhereInput = {};
    if (filters.status) where.status = filters.status as any;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search } },
        { client: { name: { contains: filters.search } } },
      ];
    }
    return this.prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        _count: { select: { items: true, payments: true } },
      },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: 'asc' },
          include: { furnitureType: true },
        },
        payments: { orderBy: { paidAt: 'desc' } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!quote) throw new NotFoundException('Cotización no encontrada');
    return quote;
  }

  async create(dto: CreateQuoteDto, userId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    const number = await this.nextNumber();

    // calcular totales
    const itemsData = (dto.items ?? []).map((it, idx) => {
      const subtotal = Number((it.unitPrice * it.quantity).toFixed(2));
      return {
        furnitureTypeId: it.furnitureTypeId,
        title: it.title,
        specs: it.specs ?? {},
        notes: it.notes ?? null,
        unitPrice: new Prisma.Decimal(it.unitPrice),
        quantity: it.quantity,
        subtotal: new Prisma.Decimal(subtotal),
        order: it.order ?? idx,
      };
    });

    const subtotal = itemsData.reduce((acc, i) => acc + Number(i.subtotal), 0);
    const discount = dto.discount ?? 0;
    const base = Math.max(0, subtotal - discount);
    const taxRate = dto.taxRate ?? 0;
    const taxAmount = Number(((base * taxRate) / 100).toFixed(2));
    const total = Number((base + taxAmount).toFixed(2));

    return this.prisma.quote.create({
      data: {
        number,
        clientId: dto.clientId,
        createdById: userId,
        status: dto.status ?? 'DRAFT',
        subtotal: new Prisma.Decimal(subtotal),
        discount: new Prisma.Decimal(discount),
        taxRate: new Prisma.Decimal(taxRate),
        taxAmount: new Prisma.Decimal(taxAmount),
        total: new Prisma.Decimal(total),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        notes: dto.notes ?? null,
        internalNotes: dto.internalNotes ?? null,
        items: { create: itemsData },
      },
      include: {
        client: true,
        items: { include: { furnitureType: true } },
      },
    });
  }

  async update(id: string, dto: UpdateQuoteDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'SENT') data.sentAt = new Date();
      if (dto.status === 'ACCEPTED') data.acceptedAt = new Date();
    }
    if (dto.discount !== undefined) data.discount = new Prisma.Decimal(dto.discount);
    if (dto.taxRate !== undefined) data.taxRate = new Prisma.Decimal(dto.taxRate);
    if (dto.validUntil !== undefined) data.validUntil = dto.validUntil ? new Date(dto.validUntil) : null;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.internalNotes !== undefined) data.internalNotes = dto.internalNotes;

    await this.prisma.quote.update({ where: { id }, data });
    if (dto.discount !== undefined || dto.taxRate !== undefined) {
      await this.recalcTotals(id);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const q = await this.findOne(id);
    if (q.status !== 'DRAFT' && q.status !== 'REJECTED' && q.status !== 'EXPIRED') {
      throw new BadRequestException('Solo se pueden eliminar cotizaciones en borrador/rechazadas/expiradas');
    }
    await this.prisma.quote.delete({ where: { id } });
    return { ok: true };
  }

  // ITEMS
  async addItem(quoteId: string, dto: CreateQuoteItemDto) {
    await this.findOne(quoteId);
    const subtotal = Number((dto.unitPrice * dto.quantity).toFixed(2));
    const ft = await this.prisma.furnitureType.findUnique({ where: { id: dto.furnitureTypeId } });
    if (!ft) throw new NotFoundException('Tipo de mueble no encontrado');
    const created = await this.prisma.quoteItem.create({
      data: {
        quoteId,
        furnitureTypeId: dto.furnitureTypeId,
        title: dto.title,
        specs: dto.specs ?? {},
        notes: dto.notes ?? null,
        unitPrice: new Prisma.Decimal(dto.unitPrice),
        quantity: dto.quantity,
        subtotal: new Prisma.Decimal(subtotal),
        order: dto.order ?? 0,
      },
      include: { furnitureType: true },
    });
    await this.recalcTotals(quoteId);
    return created;
  }

  async updateItem(quoteId: string, itemId: string, dto: UpdateQuoteItemDto) {
    const item = await this.prisma.quoteItem.findUnique({ where: { id: itemId } });
    if (!item || item.quoteId !== quoteId) throw new NotFoundException('Partida no encontrada');
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.specs !== undefined) data.specs = dto.specs;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.unitPrice !== undefined) data.unitPrice = new Prisma.Decimal(dto.unitPrice);
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.unitPrice !== undefined || dto.quantity !== undefined) {
      const newUnit = dto.unitPrice ?? Number(item.unitPrice);
      const newQty = dto.quantity ?? item.quantity;
      data.subtotal = new Prisma.Decimal(Number((newUnit * newQty).toFixed(2)));
    }
    const updated = await this.prisma.quoteItem.update({
      where: { id: itemId },
      data,
      include: { furnitureType: true },
    });
    await this.recalcTotals(quoteId);
    return updated;
  }

  async removeItem(quoteId: string, itemId: string) {
    const item = await this.prisma.quoteItem.findUnique({ where: { id: itemId } });
    if (!item || item.quoteId !== quoteId) throw new NotFoundException('Partida no encontrada');
    await this.prisma.quoteItem.delete({ where: { id: itemId } });
    await this.recalcTotals(quoteId);
    return { ok: true };
  }

  private async recalcTotals(quoteId: string) {
    const items = await this.prisma.quoteItem.findMany({ where: { quoteId } });
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) return;
    const subtotal = items.reduce((acc, i) => acc + Number(i.subtotal), 0);
    const discount = Number(quote.discount);
    const taxRate = Number(quote.taxRate);
    const base = Math.max(0, subtotal - discount);
    const taxAmount = Number(((base * taxRate) / 100).toFixed(2));
    const total = Number((base + taxAmount).toFixed(2));
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        taxAmount: new Prisma.Decimal(taxAmount),
        total: new Prisma.Decimal(total),
      },
    });
  }

  private async nextNumber(): Promise<string> {
    const last = await this.prisma.quote.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { number: true },
    });
    let n = 1;
    if (last) {
      const m = last.number.match(/(\d+)$/);
      if (m) n = parseInt(m[1], 10) + 1;
    }
    return `FET-${String(n).padStart(4, '0')}`;
  }
}
