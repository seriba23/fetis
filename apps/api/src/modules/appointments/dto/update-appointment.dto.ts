import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsIn(['CONSULTATION', 'MEASUREMENT', 'DELIVERY', 'AFTERSALE'])
  type?: 'CONSULTATION' | 'MEASUREMENT' | 'DELIVERY' | 'AFTERSALE';

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'RESCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status?: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

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
