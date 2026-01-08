import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  unit_of_measure?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  currency?: string;

  @IsOptional()
  serial_number?: string;

  @IsOptional()
  allow_low_stock_limit?: boolean;

  @IsOptional()
  low_stock_threshold?: number;

  @IsOptional()
  suggested_sale_cost?: number;

  @IsOptional()
  price?: number;

  @IsOptional()
  stock?: number;

  @IsOptional()
  sku?: string;

  @IsOptional()
  brand_id?: number;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsArray({ message: 'Los IDs de categorías deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de categoría debe ser un número' })
  category_ids?: number[];

  @IsOptional()
  @IsArray({ message: 'Los IDs de subcategorías deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de subcategoría debe ser un número' })
  subcategory_ids?: number[];
}
