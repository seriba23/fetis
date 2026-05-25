import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const onlyDigits = (v: any) => (typeof v === 'string' ? v.replace(/\D/g, '') : v);
const nullableString = (v: any) => (v === '' || v == null ? null : v);

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @IsOptional()
  @Transform(({ value }) => nullableString(value))
  @IsEmail({}, { message: 'Email inválido' })
  email?: string | null;

  @Transform(({ value }) => onlyDigits(value))
  @Matches(/^\d{10}$/, { message: 'El teléfono debe tener exactamente 10 dígitos' })
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => nullableString(value))
  street?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => nullableString(value))
  extNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => nullableString(value))
  intNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => nullableString(value))
  neighborhood?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => nullableString(value))
  city?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => nullableString(value))
  state?: string | null;

  @IsOptional()
  @Transform(({ value }) => nullableString(value))
  @Matches(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos' })
  postalCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) => nullableString(value))
  country?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => nullableString(value))
  addressNotes?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => nullableString(value))
  notes?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string | null;
}
