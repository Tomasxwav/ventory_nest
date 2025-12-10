import { IsNotEmpty, IsString, MinLength, IsNumber } from 'class-validator';

export class CreateSubcategoryDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El ID de categoría es requerido' })
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  categoryId: number;
}
