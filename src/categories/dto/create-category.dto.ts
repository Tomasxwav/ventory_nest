import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MinLength(2, { message: 'La descripción debe tener al menos 2 caracteres' })
  description?: string;
}
