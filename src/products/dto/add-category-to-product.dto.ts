import { IsNotEmpty, IsNumber, IsArray, ArrayMinSize } from 'class-validator';

export class AddCategoryToProductDto {
  @IsNotEmpty({ message: 'Los IDs de categorías son requeridos' })
  @IsArray({ message: 'Los IDs de categorías deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos una categoría' })
  @IsNumber({}, { each: true, message: 'Cada ID de categoría debe ser un número' })
  category_ids: number[];
}
