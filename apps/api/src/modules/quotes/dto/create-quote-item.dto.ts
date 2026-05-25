import { IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateQuoteItemDto {
  @IsUUID()
  furnitureTypeId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsInt()
  order?: number;
}
