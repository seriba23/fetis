import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('search') search?: string,
  ) {
    return this.quotes.findAll({ status, clientId, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotes.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user: JwtUser) {
    return this.quotes.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotes.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotes.remove(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateQuoteItemDto) {
    return this.quotes.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateQuoteItemDto) {
    return this.quotes.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.quotes.removeItem(id, itemId);
  }
}
