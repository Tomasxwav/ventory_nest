import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsIn } from 'class-validator';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsNumber()
  purchaseId?: number;

  @IsOptional()
  @IsNumber()
  purchaseOrderItemId?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Purchase cost must be greater than or equal to 0' })
  purchaseCost: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Sale cost must be greater than or equal to 0' })
  saleCost: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['mxn', 'usd', 'eur'], { message: 'Purchase currency must be a valid currency (mxn, usd, eur)' })
  purchaseCurrency: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['mxn', 'usd', 'eur'], { message: 'Sale currency must be a valid currency (mxn, usd, eur)' })
  saleCurrency: string;
}
