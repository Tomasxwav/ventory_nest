import { IsNumber, IsDateString, IsString, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryItemDto {
  @IsNumber()
  sales_order_item_id: number;

  @IsNumber()
  product_id: number;

  @IsNumber()
  @Min(1)
  quantity_delivered: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateDeliveryDto {
  @IsString()
  delivery_number: string;

  @IsNumber()
  sales_order_id: number;

  @IsDateString()
  delivery_date: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  delivery_address?: string;

  @IsString()
  @IsOptional()
  tracking_number?: string;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsDateString()
  @IsOptional()
  estimated_delivery_date?: string;

  @IsDateString()
  @IsOptional()
  actual_delivery_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  user_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryItemDto)
  items: CreateDeliveryItemDto[];
}
