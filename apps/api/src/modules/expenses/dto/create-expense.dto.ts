import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const CATEGORIES = ['RENT', 'SOFTWARE', 'SALARY', 'SUPPLIER', 'UTILITIES', 'MARKETING', 'MAINTENANCE', 'TAXES', 'OTHER'] as const;
type Category = (typeof CATEGORIES)[number];

const STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;
type Status = (typeof STATUSES)[number];

const METHODS = ['CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER'] as const;
type Method = (typeof METHODS)[number];

export class CreateExpenseDto {
  @IsString()
  name!: string;

  @IsIn(CATEGORIES as any)
  category!: Category;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsIn(STATUSES as any)
  status?: Status;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  payee?: string;

  @IsOptional()
  @IsIn(METHODS as any)
  method?: Method;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}
