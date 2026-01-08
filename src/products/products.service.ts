import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductSubcategory } from './entities/product-subcategory.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddCategoryToProductDto } from './dto/add-category-to-product.dto';
import { AddSubcategoryToProductDto } from './dto/add-subcategory-to-product.dto';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { Item } from '../items/entities/item.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductSubcategory)
    private readonly productSubcategoryRepository: Repository<ProductSubcategory>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
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

    // Verificar categorías si se proporcionaron
    if (createProductDto.category_ids && createProductDto.category_ids.length > 0) {
      for (const categoryId of createProductDto.category_ids) {
        const category = await this.categoryRepository.findOne({
          where: { id: categoryId },
        });
        if (!category) {
          throw new NotFoundException(`La categoría con ID ${categoryId} no existe`);
        }
      }
    }

    // Verificar subcategorías si se proporcionaron
    if (createProductDto.subcategory_ids && createProductDto.subcategory_ids.length > 0) {
      for (const subcategoryId of createProductDto.subcategory_ids) {
        const subcategory = await this.subcategoryRepository.findOne({
          where: { id: subcategoryId },
        });
        if (!subcategory) {
          throw new NotFoundException(`La subcategoría con ID ${subcategoryId} no existe`);
        }
      }
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
      image: imagePath,
    });

    const savedProduct = await this.productRepository.save(product);

    // Crear relaciones N:M con categorías
    if (createProductDto.category_ids && createProductDto.category_ids.length > 0) {
      for (const categoryId of createProductDto.category_ids) {
        const productCategory = this.productCategoryRepository.create({
          product_id: savedProduct.id,
          category_id: categoryId,
        });
        await this.productCategoryRepository.save(productCategory);
      }
    }

    // Crear relaciones N:M con subcategorías
    if (createProductDto.subcategory_ids && createProductDto.subcategory_ids.length > 0) {
      for (const subcategoryId of createProductDto.subcategory_ids) {
        const productSubcategory = this.productSubcategoryRepository.create({
          product_id: savedProduct.id,
          subcategory_id: subcategoryId,
        });
        await this.productSubcategoryRepository.save(productSubcategory);
      }
    }

    return savedProduct;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('product.items', 'item')
      .select([
        'product.id as id',
        'product.name as name',
        'product.status as status',
        'product.sku as sku',
        'product.unit_of_measure as unit_of_measure',
        'product.created_at as created_at',
        'product.updated_at as updated_at',
        'brand.name as brand_name',
        'CASE WHEN product.image IS NOT NULL AND product.image != \'\' THEN true ELSE false END as image',
        'COALESCE(COUNT(DISTINCT item.id), 0) as product_count',
      ])
      .groupBy('product.id')
      .addGroupBy('brand.name')
      .addGroupBy('product.created_at')
      .addGroupBy('product.updated_at')
      .orderBy('product.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      status: product.status,
      sku: product.sku,
      unit_of_measure: product.unit_of_measure,
      created_at: product.created_at,
      updated_at: product.updated_at,
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

  // ==================== MÉTODOS PARA UPDATE ====================

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si la marca existe (si se proporciona)
    if (updateProductDto.brand_id) {
      const brand = await this.brandRepository.findOne({
        where: { id: updateProductDto.brand_id },
      });
      if (!brand) {
        throw new NotFoundException('La marca no existe');
      }
    }

    // Manejar la imagen si se proporcionó
    if (file) {
      // Eliminar imagen anterior si existe
      if (product.image) {
        const oldImagePath = path.join(
          process.cwd(),
          'uploads',
          'products',
          product.image,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateProductDto.image = file.filename;
    }

    // Actualizar campos básicos del producto
    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);

    // Actualizar categorías si se proporcionaron
    if (updateProductDto.category_ids !== undefined) {
      await this.updateProductCategories(id, updateProductDto.category_ids);
    }

    // Actualizar subcategorías si se proporcionaron
    if (updateProductDto.subcategory_ids !== undefined) {
      await this.updateProductSubcategories(id, updateProductDto.subcategory_ids);
    }

    return updatedProduct;
  }

  private async updateProductCategories(
    productId: number,
    categoryIds: number[],
  ): Promise<void> {
    // Eliminar todas las categorías actuales
    await this.productCategoryRepository.delete({ product_id: productId });

    // Agregar las nuevas categorías
    if (categoryIds && categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        const category = await this.categoryRepository.findOne({
          where: { id: categoryId },
        });
        if (!category) {
          throw new NotFoundException(`La categoría con ID ${categoryId} no existe`);
        }

        const productCategory = this.productCategoryRepository.create({
          product_id: productId,
          category_id: categoryId,
        });
        await this.productCategoryRepository.save(productCategory);
      }
    }
  }

  private async updateProductSubcategories(
    productId: number,
    subcategoryIds: number[],
  ): Promise<void> {
    // Eliminar todas las subcategorías actuales
    await this.productSubcategoryRepository.delete({ product_id: productId });

    // Agregar las nuevas subcategorías
    if (subcategoryIds && subcategoryIds.length > 0) {
      for (const subcategoryId of subcategoryIds) {
        const subcategory = await this.subcategoryRepository.findOne({
          where: { id: subcategoryId },
        });
        if (!subcategory) {
          throw new NotFoundException(
            `La subcategoría con ID ${subcategoryId} no existe`,
          );
        }

        const productSubcategory = this.productSubcategoryRepository.create({
          product_id: productId,
          subcategory_id: subcategoryId,
        });
        await this.productSubcategoryRepository.save(productSubcategory);
      }
    }
  }

  // ==================== MÉTODOS PARA GESTIONAR CATEGORÍAS ====================

  async addCategoriesToProduct(
    productId: number,
    addCategoryDto: AddCategoryToProductDto,
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    for (const categoryId of addCategoryDto.category_ids) {
      // Verificar que la categoría existe
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(`La categoría con ID ${categoryId} no existe`);
      }

      // Verificar si ya existe la relación
      const existingRelation = await this.productCategoryRepository.findOne({
        where: { product_id: productId, category_id: categoryId },
      });

      if (existingRelation) {
        throw new ConflictException(
          `El producto ya tiene asignada la categoría con ID ${categoryId}`,
        );
      }

      // Crear la relación
      const productCategory = this.productCategoryRepository.create({
        product_id: productId,
        category_id: categoryId,
      });

      await this.productCategoryRepository.save(productCategory);
    }
  }

  async removeCategoryFromProduct(
    productId: number,
    categoryId: number,
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const relation = await this.productCategoryRepository.findOne({
      where: { product_id: productId, category_id: categoryId },
    });

    if (!relation) {
      throw new NotFoundException(
        'El producto no tiene asignada esta categoría',
      );
    }

    await this.productCategoryRepository.remove(relation);
  }

  async getProductCategories(productId: number): Promise<Category[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['productCategories', 'productCategories.category'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product.productCategories.map((pc) => pc.category);
  }

  // ==================== MÉTODOS PARA GESTIONAR SUBCATEGORÍAS ====================

  async addSubcategoriesToProduct(
    productId: number,
    addSubcategoryDto: AddSubcategoryToProductDto,
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    for (const subcategoryId of addSubcategoryDto.subcategory_ids) {
      // Verificar que la subcategoría existe
      const subcategory = await this.subcategoryRepository.findOne({
        where: { id: subcategoryId },
      });

      if (!subcategory) {
        throw new NotFoundException(
          `La subcategoría con ID ${subcategoryId} no existe`,
        );
      }

      // Verificar si ya existe la relación
      const existingRelation = await this.productSubcategoryRepository.findOne({
        where: { product_id: productId, subcategory_id: subcategoryId },
      });

      if (existingRelation) {
        throw new ConflictException(
          `El producto ya tiene asignada la subcategoría con ID ${subcategoryId}`,
        );
      }

      // Crear la relación
      const productSubcategory = this.productSubcategoryRepository.create({
        product_id: productId,
        subcategory_id: subcategoryId,
      });

      await this.productSubcategoryRepository.save(productSubcategory);
    }
  }

  async removeSubcategoryFromProduct(
    productId: number,
    subcategoryId: number,
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const relation = await this.productSubcategoryRepository.findOne({
      where: { product_id: productId, subcategory_id: subcategoryId },
    });

    if (!relation) {
      throw new NotFoundException(
        'El producto no tiene asignada esta subcategoría',
      );
    }

    await this.productSubcategoryRepository.remove(relation);
  }

  async getProductSubcategories(productId: number): Promise<Subcategory[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['productSubcategories', 'productSubcategories.subcategory'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product.productSubcategories.map((ps) => ps.subcategory);
  }
}
