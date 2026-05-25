import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGalleryItemDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  thumbUrl?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
