import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
            { city: { contains: search } },
          ],
        }
      : {};
    return this.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { appointments: true, quotes: true, payments: true } },
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        appointments: { orderBy: { startTime: 'desc' }, take: 20 },
        quotes: { orderBy: { createdAt: 'desc' }, take: 20 },
        payments: { orderBy: { paidAt: 'desc' }, take: 20, include: { quote: { select: { number: true } } } },
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async create(dto: CreateClientDto) {
    await this.assertUnique({ phone: dto.phone, email: dto.email });
    try {
      return await this.prisma.client.create({ data: this.toData(dto) });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    await this.assertUnique({ phone: dto.phone, email: dto.email, excludeId: id });
    try {
      return await this.prisma.client.update({ where: { id }, data: this.toData(dto) });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.delete({ where: { id } });
    return { ok: true };
  }

  async findOrCreateByPhone(phone: string, name: string, email?: string | null, source?: string) {
    const cleanPhone = (phone ?? '').replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      throw new BadRequestException('El teléfono debe tener 10 dígitos');
    }
    const existing = await this.prisma.client.findUnique({ where: { phone: cleanPhone } });
    if (existing) return existing;
    return this.prisma.client.create({
      data: {
        name,
        phone: cleanPhone,
        email: email && email !== '' ? email : null,
        source: source || 'landing',
      },
    });
  }

  private toData(dto: CreateClientDto | UpdateClientDto): any {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email || null;
    if (dto.phone !== undefined) data.phone = (dto.phone as string).replace(/\D/g, '');
    if (dto.street !== undefined) data.street = dto.street;
    if (dto.extNumber !== undefined) data.extNumber = dto.extNumber;
    if (dto.intNumber !== undefined) data.intNumber = dto.intNumber;
    if (dto.neighborhood !== undefined) data.neighborhood = dto.neighborhood;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.state !== undefined) data.state = dto.state;
    if (dto.postalCode !== undefined) data.postalCode = dto.postalCode;
    if (dto.country !== undefined) data.country = dto.country || 'México';
    if (dto.addressNotes !== undefined) data.addressNotes = dto.addressNotes;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.source !== undefined) data.source = dto.source;
    return data;
  }

  private async assertUnique(args: { phone?: string; email?: string | null; excludeId?: string }) {
    if (args.phone) {
      const cleanPhone = args.phone.replace(/\D/g, '');
      const existing = await this.prisma.client.findUnique({ where: { phone: cleanPhone } });
      if (existing && existing.id !== args.excludeId) {
        throw new ConflictException(`Ya existe otro cliente con el teléfono ${cleanPhone}: ${existing.name}`);
      }
    }
    if (args.email && args.email !== '') {
      const existing = await this.prisma.client.findUnique({ where: { email: args.email } });
      if (existing && existing.id !== args.excludeId) {
        throw new ConflictException(`Ya existe otro cliente con ese email: ${existing.name}`);
      }
    }
  }

  private handlePrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = (e.meta as any)?.target;
      const field = Array.isArray(target) ? target.join(', ') : String(target);
      if (field.includes('phone')) throw new ConflictException('Ya existe un cliente con ese teléfono');
      if (field.includes('email')) throw new ConflictException('Ya existe un cliente con ese email');
      throw new ConflictException(`Valor duplicado en: ${field}`);
    }
    throw e as Error;
  }
}
