import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount_paid?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
