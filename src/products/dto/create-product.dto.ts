import { Transform } from 'class-transformer';
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
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  description: string;

  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  @IsString()
  @IsIn(['piece', 'package', 'volume_weight', 'by_length', 'stock'], {
    message: 'La unidad de medida debe ser válida (piece, package, volume_weight, by_length, stock)',
  })
  unit_of_measure: string;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsString()
  @IsIn(['active', 'inactive'], {
    message: 'El estado debe ser válido (active, inactive)',
  })
  status: string;

  @IsNotEmpty({ message: 'La moneda es requerida' })
  @IsString()
  @IsIn(['mxn', 'usd', 'eur'], {
    message: 'La moneda debe ser válida (mxn, usd, eur)',
  })
  currency: string;

  @IsNotEmpty({ message: 'El SKU es requerido' })
  @IsString()
  serial_number: string;

  @IsNotEmpty({ message: 'Es requerido permitir o no el stock bajo' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value; // deja pasar otros valores para que falle IsBoolean()
  })
  @IsBoolean()
  allow_low_stock_limit: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  low_stock_threshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  suggested_sale_cost?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price?: number;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock?: number;

  @IsNotEmpty({ message: 'El SKU es requerido' })
  @IsString({ message: 'El SKU debe ser un texto' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'El SKU debe ser alfanumérico (puede incluir - y _)',
  })
  sku: string;

  @IsNotEmpty({ message: 'El ID de marca es requerido' })
  @IsNumber({}, { message: 'El ID de marca debe ser un número' })
  brand_id: number;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un texto' })
  image?: string;

  // Categorías y subcategorías (muchos a muchos)
  @IsOptional()
  category_ids?: number[];

  @IsOptional()
  subcategory_ids?: number[];

  // Parámetros opcionales para crear inventario e item
  @IsOptional()
  @IsNumber({}, { message: 'El costo de compra debe ser un número' })
  @Min(0, { message: 'El costo de compra debe ser mayor o igual a 0' })
  purchase_cost?: number;

  @IsOptional()
  @IsString()
  @IsIn(['mxn', 'usd', 'eur'], {
    message: 'La moneda de compra debe ser válida (mxn, usd, eur)',
  })
  purchase_currency?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El costo de venta debe ser un número' })
  @Min(0, { message: 'El costo de venta debe ser mayor o igual a 0' })
  sale_cost?: number;

  @IsOptional()
  @IsString()
  @IsIn(['mxn', 'usd', 'eur'], {
    message: 'La moneda de venta debe ser válida (mxn, usd, eur)',
  })
  sale_currency?: string;
}
