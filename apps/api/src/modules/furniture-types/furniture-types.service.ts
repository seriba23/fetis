import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FurnitureTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(onlyActive = false) {
    return this.prisma.furnitureType.findMany({
      where: onlyActive ? { active: true } : {},
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const ft = await this.prisma.furnitureType.findUnique({ where: { id } });
    if (!ft) throw new NotFoundException('Tipo de mueble no encontrado');
    return ft;
  }

  async findBySlug(slug: string) {
    return this.prisma.furnitureType.findUnique({ where: { slug } });
  }
}
