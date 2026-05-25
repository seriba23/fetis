import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('virtual') virtual?: string,
  ) {
    return this.expenses.findAll({
      from,
      to,
      category,
      status,
      includeVirtual: virtual !== 'false',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenses.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: JwtUser) {
    return this.expenses.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenses.update(id, dto);
  }

  @Post(':id/mark-paid')
  markPaid(@Param('id') id: string, @Body('paidAt') paidAt?: string) {
    return this.expenses.markPaid(id, paidAt);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenses.remove(id);
  }
}
