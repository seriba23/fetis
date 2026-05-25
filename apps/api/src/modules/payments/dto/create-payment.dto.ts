import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  quoteId?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsIn(['CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER'])
  method!: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'OTHER';

  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'])
  status?: 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED';

  @IsOptional()
  @IsIn(['DEPOSIT', 'PROGRESS', 'FINAL', 'EXTRA', 'OTHER'])
  concept?: 'DEPOSIT' | 'PROGRESS' | 'FINAL' | 'EXTRA' | 'OTHER';

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsDateString()
  paidAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
