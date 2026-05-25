import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FurnitureTypesService } from './furniture-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('furniture-types')
export class FurnitureTypesController {
  constructor(private readonly service: FurnitureTypesService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    return this.service.findAll(active === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
