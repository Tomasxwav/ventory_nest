import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    const category = await this.categoryRepository.findOne({
      where: { id: createSubcategoryDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    const existingSubcategory = await this.subcategoryRepository.findOne({
      where: { name: createSubcategoryDto.name },
    });

    if (existingSubcategory) {
      throw new ConflictException('Ya existe una subcategoría con ese nombre');
    }

    const subcategory = this.subcategoryRepository.create(createSubcategoryDto);
    return await this.subcategoryRepository.save(subcategory);
  }

  async findAll(): Promise<Subcategory[]> {
    return await this.subcategoryRepository.find({
      relations: ['category'],
    });
  }
}
