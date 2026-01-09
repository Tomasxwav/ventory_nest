import {
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @IsOptional()
  purchase_request_item_id?: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

  @IsString()
  unit_of_measure: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  order_number: string;

  @IsInt()
  @IsOptional()
  purchase_request_id?: number;

  @IsInt()
  supplier_id: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  expected_date?: string;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  taxes?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsInt()
  created_by_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}