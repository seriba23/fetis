import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpenseTemplatesController } from './expense-templates.controller';
import { ExpenseTemplatesService } from './expense-templates.service';

@Module({
  controllers: [ExpensesController, ExpenseTemplatesController],
  providers: [ExpensesService, ExpenseTemplatesService],
  exports: [ExpensesService, ExpenseTemplatesService],
})
export class ExpensesModule {}
