import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupplierDto {

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsString({ message: 'El email debe ser un texto' })
  @MinLength(2, { message: 'El email debe tener al menos 2 caracteres' })
  email: string;

  @IsOptional()
  @IsString({ message: 'El website debe ser un texto' })
  @MinLength(2, { message: 'El website debe tener al menos 2 caracteres' })
  website: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MinLength(2, { message: 'El teléfono debe tener al menos 2 caracteres' })
  phone: string;

  @IsNotEmpty({ message: 'La calle es requerida' })
  @IsString({ message: 'La calle debe ser un texto' })
  @MinLength(2, { message: 'La calle debe tener al menos 2 caracteres' })
  street: string;

  @IsOptional()
  @IsString({ message: 'El número de calle debe ser un texto' })
  @MinLength(1, { message: 'El número de calle debe tener al menos 1 caracter' })
  street_number: string;

  @IsOptional()
  @IsString({ message: 'El apartamento debe ser un texto' })
  @MinLength(2, { message: 'El apartamento debe tener al menos 2 caracteres' })
  apartment: string;

  @IsOptional()
  @IsString({ message: 'La colonia debe ser un texto' })
  @MinLength(2, { message: 'La colonia debe tener al menos 2 caracteres' })
  neighborhood: string;
  
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser un texto' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  city: string;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsString({ message: 'El estado debe ser un texto' })
  @MinLength(2, { message: 'El estado debe tener al menos 2 caracteres' })
  state: string;

  @IsNotEmpty({ message: 'El código postal es requerido' })
  @IsString({ message: 'El código postal debe ser un texto' })
  @MinLength(2, { message: 'El código postal debe tener al menos 2 caracteres' })
  postal_code: string;

  @IsNotEmpty({ message: 'El país es requerido' })
  @IsString({ message: 'El país debe ser un texto' })
  @MinLength(2, { message: 'El país debe tener al menos 2 caracteres' })
  country: string;
}