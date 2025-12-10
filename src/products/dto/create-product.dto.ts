import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  Matches,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price: number;

  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock: number;

  @IsNotEmpty({ message: 'El SKU es requerido' })
  @IsString({ message: 'El SKU debe ser un texto' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'El SKU debe ser alfanumérico (puede incluir - y _)',
  })
  sku: string;

  @IsNotEmpty({ message: 'El ID de marca es requerido' })
  @IsNumber({}, { message: 'El ID de marca debe ser un número' })
  brandId: number;

  @IsNotEmpty({ message: 'El ID de categoría es requerido' })
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  categoryId: number;

  @IsNotEmpty({ message: 'El ID de subcategoría es requerido' })
  @IsNumber({}, { message: 'El ID de subcategoría debe ser un número' })
  subcategoryId: number;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un texto' })
  image?: string;
}
