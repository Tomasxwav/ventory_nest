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
  @IsNotEmpty({ message: 'El número de serie es requerido' })
  @IsString({ message: 'El número de serie debe ser un texto' })
  @Length(1, 255, { message: 'El número de serie debe tener entre 1 y 255 caracteres' })
  serialNumber: string;
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

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la orden de compra debe ser un número' })
  @IsPositive({ message: 'El ID de la orden de compra debe ser mayor a 0' })
  purchaseOrderId?: number;

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