import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseTemplateDto } from './create-expense-template.dto';

export class UpdateExpenseTemplateDto extends PartialType(CreateExpenseTemplateDto) {}
