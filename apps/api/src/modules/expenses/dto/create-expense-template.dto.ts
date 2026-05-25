import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

const CATEGORIES = ['RENT', 'SOFTWARE', 'SALARY', 'SUPPLIER', 'UTILITIES', 'MARKETING', 'MAINTENANCE', 'TAXES', 'OTHER'] as const;
const FREQUENCIES = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;

export class CreateExpenseTemplateDto {
  @IsString()
  name!: string;

  @IsIn(CATEGORIES as any)
  category!: (typeof CATEGORIES)[number];

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsIn(FREQUENCIES as any)
  frequency!: (typeof FREQUENCIES)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  monthOfYear?: number;

  @IsOptional()
  @IsString()
  payee?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  startsOn!: string;

  @IsOptional()
  @IsDateString()
  endsOn?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
