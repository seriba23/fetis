import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  // ITEMS
  async findAllItems(filters: { categoryId?: string; categorySlug?: string; visible?: boolean }) {
    const where: any = {};
    if (filters.visible !== undefined) where.visible = filters.visible;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.categorySlug) where.category = { slug: filters.categorySlug };
    return this.prisma.galleryItem.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { category: true },
    });
  }

  async findOneItem(id: string) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id }, include: { category: true } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    return item;
  }

  async createItem(dto: CreateGalleryItemDto) {
    const cat = await this.prisma.galleryCategory.findUnique({ where: { id: dto.categoryId } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    const willFeature = dto.featured ?? false;
    return this.prisma.$transaction(async (tx) => {
      if (willFeature) {
        await tx.galleryItem.updateMany({ where: { featured: true }, data: { featured: false } });
      }
      return tx.galleryItem.create({
        data: {
          categoryId: dto.categoryId,
          imageUrl: dto.imageUrl,
          thumbUrl: dto.thumbUrl ?? null,
          title: dto.title ?? null,
          description: dto.description ?? null,
          order: dto.order ?? 0,
          visible: dto.visible ?? true,
          featured: willFeature,
        },
        include: { category: true },
      });
    });
  }

  async updateItem(id: string, dto: UpdateGalleryItemDto) {
    await this.findOneItem(id);
    const data: any = { ...dto };
    return this.prisma.$transaction(async (tx) => {
      if (data.featured === true) {
        await tx.galleryItem.updateMany({
          where: { featured: true, NOT: { id } },
          data: { featured: false },
        });
      }
      return tx.galleryItem.update({ where: { id }, data, include: { category: true } });
    });
  }

  async removeItem(id: string) {
    await this.findOneItem(id);
    await this.prisma.galleryItem.delete({ where: { id } });
    return { ok: true };
  }

  async reorderItems(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, idx) =>
        this.prisma.galleryItem.update({ where: { id }, data: { order: idx } }),
      ),
    );
    return { ok: true };
  }

  // CATEGORIES
  async findAllCategories(onlyVisible = false) {
    return this.prisma.galleryCategory.findMany({
      where: onlyVisible ? { visible: true } : {},
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { items: { where: { visible: true } } } } },
    });
  }

  async findCategoryBySlug(slug: string) {
    const cat = await this.prisma.galleryCategory.findUnique({ where: { slug } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async createCategory(dto: CreateCategoryDto) {
    const exists = await this.prisma.galleryCategory.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new BadRequestException('Ya existe una categoría con ese slug');
    return this.prisma.galleryCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.galleryCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return this.prisma.galleryCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    const cat = await this.prisma.galleryCategory.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    if (cat._count.items > 0) {
      throw new BadRequestException('No se puede eliminar una categoría con imágenes. Mueve las imágenes primero.');
    }
    await this.prisma.galleryCategory.delete({ where: { id } });
    return { ok: true };
  }
}
