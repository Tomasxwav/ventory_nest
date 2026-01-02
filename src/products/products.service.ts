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
import { Inventory } from '../inventory/entities/inventory.entity';
import { Item } from '../items/entities/item.entity';
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
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
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
      where: { id: createProductDto.brand_id },
    });

    if (!brand) {
      throw new NotFoundException('La marca no existe');
    }

    // Verificar si la categoría existe
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar si la subcategoría existe
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id: createProductDto.subcategory_id },
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
      name: createProductDto.name,
      description: createProductDto.description,
      unit_of_measure: createProductDto.unit_of_measure,
      status: createProductDto.status,
      currency: createProductDto.currency,
      serial_number: createProductDto.serial_number,
      allow_low_stock_limit: createProductDto.allow_low_stock_limit,
      low_stock_threshold: createProductDto.low_stock_threshold,
      suggested_sale_cost: createProductDto.suggested_sale_cost,
      price: createProductDto.price,
      stock: createProductDto.stock,
      sku: createProductDto.sku,
      brand_id: createProductDto.brand_id,
      category_id: createProductDto.category_id,
      subcategory_id: createProductDto.subcategory_id,
      image: imagePath,
    });

    const savedProduct = await this.productRepository.save(product);

    // Crear inventario e item si se proporcionaron los parámetros opcionales
    await this.createInventoryIfNeeded(savedProduct, createProductDto);

    return savedProduct;
  }

  private shouldCreateInventory(createProductDto: CreateProductDto): boolean {
    return !!(
      createProductDto.sale_cost ||
      createProductDto.purchase_cost ||
      createProductDto.sale_currency !== undefined ||
      createProductDto.purchase_currency !== undefined
    );
  }

  private async createInventoryIfNeeded(
    product: Product,
    createProductDto: CreateProductDto,
  ): Promise<void> {
    if (!this.shouldCreateInventory(createProductDto)) {
      return;
    }

    // Crear el inventario usando el nombre correcto de la columna
    const inventory = this.inventoryRepository.create({
      product_id: product.id,
      purchase_id: null, // Se asignará cuando se haga una compra
    });

    const savedInventory = await this.inventoryRepository.save(inventory);

    // Crear el item
    const item = this.itemRepository.create({
      inventory_id: savedInventory.id,
      sale_cost: createProductDto.sale_cost,
      purchase_cost: createProductDto.purchase_cost,
      sale_currency: createProductDto.sale_currency,
      purchase_currency: createProductDto.purchase_currency,
    });

    await this.itemRepository.save(item);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('product.inventories', 'inventory')
      .leftJoin('inventory.items', 'item')
      .select([
        'product.id as id',
        'product.name as name',
        'product.status as status',
        'product.sku as sku',
        'brand.name as brand_name',
        'CASE WHEN product.image IS NOT NULL AND product.image != \'\' THEN true ELSE false END as image',
        'COALESCE(COUNT(DISTINCT item.id), 0) as product_count',
      ])
      .groupBy('product.id')
      .addGroupBy('brand.name')
      .orderBy('product.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      status: product.status,
      sku: product.sku,
      brand_name: product.brand_name,
      image: product.image === 'true' || product.image === true || product.image === 1,
      product_count: parseInt(product.product_count) || 0,
    }));
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
