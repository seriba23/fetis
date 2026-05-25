import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { ReorderDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gallery')
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('category') categorySlug?: string,
    @Query('visible') visible?: string,
  ) {
    return this.gallery.findAllItems({
      categoryId,
      categorySlug,
      visible: visible === undefined ? undefined : visible === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gallery.findOneItem(id);
  }

  @Post()
  create(@Body() dto: CreateGalleryItemDto) {
    return this.gallery.createItem(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.gallery.updateItem(id, dto);
  }

  @Post('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.gallery.reorderItems(dto.ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gallery.removeItem(id);
  }
}
