import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsPositive,
  Min,
  Length,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser un texto' })
  @Length(1, 255, { message: 'El número de serie debe tener entre 1 y 255 caracteres' })
  serialNumber?: string;

  @IsNotEmpty({ message: 'El costo de compra es requerido' })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El costo de compra debe ser un número válido' })
  @IsPositive({ message: 'El costo de compra debe ser mayor a 0' })
  purchaseCost: number;

  @IsNotEmpty({ message: 'El costo de venta es requerido' })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El costo de venta debe ser un número válido' })
  @IsPositive({ message: 'El costo de venta debe ser mayor a 0' })
  saleCost: number;

  @IsOptional()
  @IsString({ message: 'La moneda de compra debe ser un texto' })
  @Length(3, 10, { message: 'La moneda de compra debe tener entre 3 y 10 caracteres' })
  purchaseCurrency?: string;

  @IsOptional()
  @IsString({ message: 'La moneda de venta debe ser un texto' })
  @Length(3, 10, { message: 'La moneda de venta debe tener entre 3 y 10 caracteres' })
  saleCurrency?: string;
}

export class PurchaseProductDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  @IsPositive({ message: 'El ID del producto debe ser mayor a 0' })
  productId: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @IsNotEmpty({ message: 'El campo serialized es requerido' })
  @IsBoolean({ message: 'El campo serialized debe ser un booleano' })
  serialized: boolean;

  @ValidateIf((o) => !o.serialized)
  @IsNotEmpty({ message: 'El costo de compra es requerido cuando serialized es false' })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El costo de compra debe ser un número válido' })
  @IsPositive({ message: 'El costo de compra debe ser mayor a 0' })
  purchaseCost?: number;

  @ValidateIf((o) => !o.serialized)
  @IsNotEmpty({ message: 'El costo de venta es requerido cuando serialized es false' })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El costo de venta debe ser un número válido' })
  @IsPositive({ message: 'El costo de venta debe ser mayor a 0' })
  saleCost?: number;

  @ValidateIf((o) => !o.serialized)
  @IsOptional()
  @IsString({ message: 'La moneda de compra debe ser un texto' })
  @Length(3, 10, { message: 'La moneda de compra debe tener entre 3 y 10 caracteres' })
  purchaseCurrency?: string;

  @ValidateIf((o) => !o.serialized)
  @IsOptional()
  @IsString({ message: 'La moneda de venta debe ser un texto' })
  @Length(3, 10, { message: 'La moneda de venta debe tener entre 3 y 10 caracteres' })
  saleCurrency?: string;

  // Solo requerido si serialized = true
  @ValidateIf((o) => o.serialized)
  @IsNotEmpty({ message: 'Los items son requeridos cuando serialized es true' })
  @IsArray({ message: 'Los items deben ser un arreglo' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Debe haber al menos un item cuando serialized es true' })
  @Type(() => CreateItemDto)
  items?: CreateItemDto[];
}

export class CreatePurchasesDto {
  @IsNotEmpty({ message: 'El voucher es requerido' })
  @IsString({ message: 'El voucher debe ser un texto' })
  @MinLength(2, { message: 'El voucher debe tener al menos 2 caracteres' })
  @Length(2, 255, { message: 'El voucher debe tener entre 2 y 255 caracteres' })
  voucher: string;

  @IsNotEmpty({ message: 'La factura es requerida' })
  @IsString({ message: 'La factura debe ser un texto' })
  @MinLength(2, { message: 'La factura debe tener al menos 2 caracteres' })
  @Length(2, 255, { message: 'La factura debe tener entre 2 y 255 caracteres' })
  invoice: string;

  @IsNotEmpty({ message: 'El ID del proveedor es requerido' })
  @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
  @IsPositive({ message: 'El ID del proveedor debe ser mayor a 0' })
  supplierId: number;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;

  @IsNotEmpty({ message: 'Los productos son requeridos' })
  @IsArray({ message: 'Los productos deben ser un arreglo' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Debe haber al menos un producto en la compra' })
  @Type(() => PurchaseProductDto)
  products: PurchaseProductDto[];
}