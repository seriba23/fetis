import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
import { MailService } from '../mail/mail.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { buildContactEmailHtml, buildContactEmailText } from './contact-email.template';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
    private readonly mail: MailService,
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
      where: { group: { in: ['business', 'landing', 'general', 'branding'] } },
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

    this.sendContactNotification(dto, phone, appointment.startTime).catch((err) => {
      this.logger.error(`Notificación de contacto falló: ${err?.message ?? err}`);
    });

    return {
      ok: true,
      message: 'Gracias, tu solicitud fue recibida. Te contactaremos en menos de 24 horas.',
      requestId: contactRequest.id,
    };
  }

  private async sendContactNotification(
    dto: CreateContactRequestDto,
    phone: string,
    appointmentStart: Date,
  ) {
    const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
    if (!to) {
      this.logger.warn('CONTACT_NOTIFICATION_EMAIL no configurada, se omite el email');
      return;
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000').replace(/\/$/, '');
    const adminUrl = `${siteUrl}/admin/clientes`;
    const phoneFormatted = phone.length === 10 ? `${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}` : phone;
    const furnitureTypeLabel = dto.furnitureType ? this.furnitureLabel(dto.furnitureType) : null;
    const appointmentDate = dayjs(appointmentStart).format('DD/MM/YYYY HH:mm') + 'h';

    const data = {
      name: dto.name,
      phone,
      phoneFormatted,
      email: dto.email && dto.email !== '' ? dto.email : null,
      furnitureTypeLabel,
      message: dto.message,
      source: dto.source ?? null,
      appointmentDate,
      adminUrl,
    };

    await this.mail.send({
      to,
      subject: `Nueva solicitud: ${dto.name}${furnitureTypeLabel ? ` — ${furnitureTypeLabel}` : ''}`,
      html: buildContactEmailHtml(data),
      text: buildContactEmailText(data),
      replyTo: data.email ?? undefined,
    });
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
