import { Controller, Get, Post, Body } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { Subcategory } from './entities/subcategory.entity';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post()
  create(@Body() createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    return this.subcategoriesService.create(createSubcategoryDto);
  }

  @Get()
  findAll(): Promise<Subcategory[]> {
    return this.subcategoriesService.findAll();
  }
}
