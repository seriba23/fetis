import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gallery-categories')
export class GalleryCategoriesController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  findAll(@Query('visible') visible?: string) {
    return this.gallery.findAllCategories(visible === 'true');
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.gallery.createCategory(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.gallery.updateCategory(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gallery.removeCategory(id);
  }
}
