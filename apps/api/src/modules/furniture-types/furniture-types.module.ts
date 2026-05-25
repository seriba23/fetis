import { Module } from '@nestjs/common';
import { FurnitureTypesController } from './furniture-types.controller';
import { FurnitureTypesService } from './furniture-types.service';

@Module({
  controllers: [FurnitureTypesController],
  providers: [FurnitureTypesService],
  exports: [FurnitureTypesService],
})
export class FurnitureTypesModule {}
