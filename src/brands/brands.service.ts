import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const existingBrand = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });

    if (existingBrand) {
      throw new ConflictException('Ya existe una marca con ese nombre');
    }

    const brand = this.brandRepository.create(createBrandDto);
    return await this.brandRepository.save(brand);
  }

  async findAll() {
    const brands = await this.brandRepository
      .createQueryBuilder('brand')
      .leftJoin('brand.products', 'product')
      .select('brand.id', 'id')
      .addSelect('brand.name', 'name')
      .addSelect('brand.created_at', 'created_at')
      .addSelect('brand.updated_at', 'updated_at')
      .addSelect('COUNT(product.id)', 'product_count')
      .groupBy('brand.id')
      .addGroupBy('brand.name')
      .addGroupBy('brand.created_at')
      .addGroupBy('brand.updated_at')
      .getRawMany();

    return brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
      product_count: parseInt(brand.product_count),
    }));
  }
}
