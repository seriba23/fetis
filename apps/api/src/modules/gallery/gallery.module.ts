import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryCategoriesController } from './categories.controller';

@Module({
  controllers: [GalleryController, GalleryCategoriesController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
