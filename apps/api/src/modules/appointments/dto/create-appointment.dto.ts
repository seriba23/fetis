import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  clientId!: string;

  @IsIn(['CONSULTATION', 'MEASUREMENT', 'DELIVERY', 'AFTERSALE'])
  type!: 'CONSULTATION' | 'MEASUREMENT' | 'DELIVERY' | 'AFTERSALE';

  @IsOptional()
  @IsString()
  title?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
