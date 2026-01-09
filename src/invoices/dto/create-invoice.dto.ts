import { IsNumber, IsDateString, IsString, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsNumber()
  delivery_item_id: number;

  @IsNumber()
  product_id: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_rate?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateInvoiceDto {
  @IsString()
  invoice_number: string;

  @IsNumber()
  delivery_id: number;

  @IsDateString()
  invoice_date: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_rate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  user_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
