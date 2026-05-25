import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  getAll(@Query('group') group?: string) {
    return this.settings.getAll(group);
  }

  @Post()
  upsertMany(@Body() body: { items: Array<{ key: string; value: any; type?: string; group?: string }> }) {
    return this.settings.upsertMany(body.items ?? []);
  }
}
