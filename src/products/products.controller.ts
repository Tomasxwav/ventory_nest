import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Res,
  BadRequestException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddCategoryToProductDto } from './dto/add-category-to-product.dto';
import { AddSubcategoryToProductDto } from './dto/add-subcategory-to-product.dto';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);
  
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = /jpg|jpeg|png|webp/;
        const ext = extname(file.originalname).toLowerCase();
        const mimetype = allowedExtensions.test(file.mimetype);
        const extension = allowedExtensions.test(ext);

        if (mimetype && extension) {
          return cb(null, true);
        }

        cb(
          new BadRequestException(
            'Solo se permiten imágenes (jpg, jpeg, png, webp)',
          ),
          false,
        );
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Body() body: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    this.logger.log(`Body recibido: ${JSON.stringify(body)}`);
    const createProductDto = plainToInstance(CreateProductDto, body);
    this.logger.log(`DTO transformado: ${JSON.stringify(createProductDto)}`);
    
    const errors = await validate(createProductDto);
    if (errors.length > 0) {
      const messages = errors.map(error => Object.values(error.constraints || {})).flat();
      throw new BadRequestException(messages);
    }
    
    return this.productsService.create(createProductDto, file);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter[name]') filterName?: string,
  ): Promise<any[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productsService.findAll(pageNum, limitNum, filterName);
  }

  @Get(':id/image')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const imagePath = await this.productsService.getImage(id);
    res.sendFile(imagePath);
  }

  // ==================== ENDPOINTS PARA UPDATE ====================

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = /jpg|jpeg|png|webp/;
        const ext = extname(file.originalname).toLowerCase();
        const mimetype = allowedExtensions.test(file.mimetype);
        const extension = allowedExtensions.test(ext);

        if (mimetype && extension) {
          return cb(null, true);
        }

        cb(
          new BadRequestException(
            'Solo se permiten imágenes (jpg, jpeg, png, webp)',
          ),
          false,
        );
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    const updateProductDto = plainToInstance(UpdateProductDto, body);
    
    const errors = await validate(updateProductDto);
    if (errors.length > 0) {
      const messages = errors.map(error => Object.values(error.constraints || {})).flat();
      throw new BadRequestException(messages);
    }
    
    return this.productsService.update(id, updateProductDto, file);
  }

  // ==================== ENDPOINTS PARA CATEGORÍAS ====================

  @Post(':id/categories')
  @HttpCode(HttpStatus.CREATED)
  async addCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() addCategoryDto: AddCategoryToProductDto,
  ): Promise<{ message: string }> {
    await this.productsService.addCategoriesToProduct(id, addCategoryDto);
    return { message: 'Categorías agregadas exitosamente' };
  }

  @Delete(':id/categories/:categoryId')
  @HttpCode(HttpStatus.OK)
  async removeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<{ message: string }> {
    await this.productsService.removeCategoryFromProduct(id, categoryId);
    return { message: 'Categoría eliminada exitosamente' };
  }

  @Get(':id/categories')
  async getCategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category[]> {
    return this.productsService.getProductCategories(id);
  }

  // ==================== ENDPOINTS PARA SUBCATEGORÍAS ====================

  @Post(':id/subcategories')
  @HttpCode(HttpStatus.CREATED)
  async addSubcategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() addSubcategoryDto: AddSubcategoryToProductDto,
  ): Promise<{ message: string }> {
    await this.productsService.addSubcategoriesToProduct(id, addSubcategoryDto);
    return { message: 'Subcategorías agregadas exitosamente' };
  }

  @Delete(':id/subcategories/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  async removeSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('subcategoryId', ParseIntPipe) subcategoryId: number,
  ): Promise<{ message: string }> {
    await this.productsService.removeSubcategoryFromProduct(id, subcategoryId);
    return { message: 'Subcategoría eliminada exitosamente' };
  }

  @Get(':id/subcategories')
  async getSubcategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Subcategory[]> {
    return this.productsService.getProductSubcategories(id);
  }
}
