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
import {
  PurchaseRequestStatus,
  PurchaseRequestPriority,
} from '../entities/purchase-request.entity';

export class CreatePurchaseRequestItemDto {
  @IsInt()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsString()
  unit_of_measure: string;

  @IsString()
  @IsOptional()
  details?: string;
}

export class CreatePurchaseRequestDto {
  @IsString()
  request_number: string;

  @IsInt()
  user_id: number;

  @IsDateString()
  request_date: string;

  @IsEnum(PurchaseRequestStatus)
  @IsOptional()
  status?: PurchaseRequestStatus;

  @IsEnum(PurchaseRequestPriority)
  @IsOptional()
  priority?: PurchaseRequestPriority;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRequestItemDto)
  items: CreatePurchaseRequestItemDto[];
}
