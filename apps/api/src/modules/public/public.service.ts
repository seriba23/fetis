import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
  ) {}

  async getGallery(categorySlug?: string, limit?: number) {
    return this.prisma.galleryItem.findMany({
      where: {
        visible: true,
        category: { visible: true, ...(categorySlug ? { slug: categorySlug } : {}) },
      },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      take: limit && limit > 0 ? limit : undefined,
      include: { category: { select: { slug: true, name: true } } },
    });
  }

  async getCategories() {
    return this.prisma.galleryCategory.findMany({
      where: { visible: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { items: { where: { visible: true } } } } },
    });
  }

  async getFurnitureTypes() {
    return this.prisma.furnitureType.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, slug: true, name: true, icon: true, description: true },
    });
  }

  async getBusinessInfo() {
    const settings = await this.prisma.setting.findMany({
      where: { group: { in: ['business', 'landing', 'general'] } },
    });
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async submitContactRequest(dto: CreateContactRequestDto) {
    const phone = dto.phone.trim();
    const client = await this.clients.findOrCreateByPhone(
      phone,
      dto.name,
      dto.email && dto.email !== '' ? dto.email : null,
      'landing',
    );

    const start = dayjs().add(2, 'day').hour(11).minute(0).second(0).millisecond(0).toDate();
    const end = dayjs(start).add(1, 'hour').toDate();

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: client.id,
        type: 'CONSULTATION',
        status: 'PENDING',
        title: `Consulta inicial - ${dto.furnitureType ? this.furnitureLabel(dto.furnitureType) : 'General'}`,
        startTime: start,
        endTime: end,
        notes: dto.message,
        internalNotes: dto.furnitureType ? `Interés inicial: ${dto.furnitureType}` : null,
      },
    });

    const contactRequest = await this.prisma.contactRequest.create({
      data: {
        name: dto.name,
        email: dto.email && dto.email !== '' ? dto.email : null,
        phone,
        furnitureType: dto.furnitureType ?? null,
        message: dto.message,
        clientId: client.id,
        appointmentId: appointment.id,
        source: dto.source ?? null,
      },
    });

    return {
      ok: true,
      message: 'Gracias, tu solicitud fue recibida. Te contactaremos en menos de 24 horas.',
      requestId: contactRequest.id,
    };
  }

  private furnitureLabel(slug: string) {
    const map: Record<string, string> = {
      cocina: 'Cocina',
      closet: 'Closet',
      mesa: 'Mesa',
      silla: 'Silla',
      recamara: 'Recámara',
      sala: 'Sala',
      sofa: 'Sofá',
      'mueble-tv': 'Mueble TV',
      otros: 'Otros',
    };
    return map[slug] ?? slug;
  }
}
