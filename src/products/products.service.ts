import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    // Verificar si el SKU ya existe
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con ese SKU');
    }

    // Verificar si la marca existe
    const brand = await this.brandRepository.findOne({
      where: { id: createProductDto.brandId },
    });

    if (!brand) {
      throw new NotFoundException('La marca no existe');
    }

    // Verificar si la categoría existe
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar si la subcategoría existe
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id: createProductDto.subcategoryId },
    });

    if (!subcategory) {
      throw new NotFoundException('La subcategoría no existe');
    }

    // Manejar la imagen si se proporcionó
    let imagePath: string | null = null;
    if (file) {
      imagePath = file.filename;
    }

    const product = this.productRepository.create({
      ...createProductDto,
      image: imagePath,
    });

    return await this.productRepository.save(product);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    data: Product[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const [data, total] = await this.productRepository.findAndCount({
      relations: ['brand', 'category', 'subcategory'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getImage(id: number): Promise<string> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (!product.image) {
      throw new NotFoundException('El producto no tiene imagen');
    }

    const imagePath = path.join(
      process.cwd(),
      'uploads',
      'products',
      product.image,
    );

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Archivo de imagen no encontrado');
    }

    return imagePath;
  }
}
