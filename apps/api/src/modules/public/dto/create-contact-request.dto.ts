import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const onlyDigits = (v: any) => (typeof v === 'string' ? v.replace(/\D/g, '') : v);

export class CreateContactRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? null : value))
  @IsEmail({}, { message: 'Email inválido' })
  email?: string | null;

  @Transform(({ value }) => onlyDigits(value))
  @Matches(/^\d{10}$/, { message: 'El teléfono debe tener exactamente 10 dígitos' })
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  furnitureType?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  source?: string;
}
