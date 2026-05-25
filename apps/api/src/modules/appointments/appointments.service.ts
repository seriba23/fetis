import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { from?: string; to?: string; status?: string; type?: string; clientId?: string }) {
    const where: any = {};
    if (filters.from || filters.to) {
      where.startTime = {};
      if (filters.from) where.startTime.gte = new Date(filters.from);
      if (filters.to) where.startTime.lte = new Date(filters.to);
    }
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.clientId) where.clientId = filters.clientId;

    return this.prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  async create(dto: CreateAppointmentDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) throw new BadRequestException('endTime debe ser posterior a startTime');
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.prisma.appointment.create({
      data: {
        clientId: dto.clientId,
        type: dto.type,
        title: dto.title || null,
        startTime: start,
        endTime: end,
        address: dto.address || null,
        notes: dto.notes || null,
        internalNotes: dto.internalNotes || null,
      },
      include: { client: { select: { id: true, name: true, phone: true, email: true } } },
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.internalNotes !== undefined) data.internalNotes = dto.internalNotes;
    return this.prisma.appointment.update({
      where: { id },
      data,
      include: { client: { select: { id: true, name: true, phone: true, email: true } } },
    });
  }

  async confirm(id: string) {
    await this.findOne(id);
    return this.prisma.appointment.update({ where: { id }, data: { status: 'CONFIRMED' } });
  }

  async cancel(id: string, reason?: string) {
    await this.findOne(id);
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason || null },
    });
  }

  async complete(id: string) {
    await this.findOne(id);
    return this.prisma.appointment.update({ where: { id }, data: { status: 'COMPLETED' } });
  }

  async reschedule(id: string, startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) throw new BadRequestException('endTime debe ser posterior a startTime');
    await this.findOne(id);
    return this.prisma.appointment.update({
      where: { id },
      data: { startTime: start, endTime: end, status: 'RESCHEDULED' },
      include: { client: { select: { id: true, name: true, phone: true, email: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.appointment.delete({ where: { id } });
    return { ok: true };
  }
}
