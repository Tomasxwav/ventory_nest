import { IsString, IsEmail, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalesOrderItemDto } from './create-sales-order.dto';

export class UpdateSalesOrderDto {
  @IsString()
  @IsOptional()
  order_number?: string;

  @IsNumber()
  @IsOptional()
  client_id?: number;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  customer_address?: string;

  @IsDateString()
  @IsOptional()
  order_date?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items?: CreateSalesOrderItemDto[];
}
