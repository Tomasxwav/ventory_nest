import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateDeliveryDto {
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
}
