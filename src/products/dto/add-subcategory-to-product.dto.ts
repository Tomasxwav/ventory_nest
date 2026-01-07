import { IsNotEmpty, IsNumber, IsArray, ArrayMinSize } from 'class-validator';

export class AddSubcategoryToProductDto {
  @IsNotEmpty({ message: 'Los IDs de subcategorías son requeridos' })
  @IsArray({ message: 'Los IDs de subcategorías deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos una subcategoría' })
  @IsNumber({}, { each: true, message: 'Cada ID de subcategoría debe ser un número' })
  subcategory_ids: number[];
}
