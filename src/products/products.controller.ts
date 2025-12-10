import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
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
    console.log('Body recibido:', body);
    const createProductDto = plainToInstance(CreateProductDto, body);
    console.log('DTO transformado:', createProductDto);
    
    // Validar manualmente
    const errors = await validate(createProductDto);
    if (errors.length > 0) {
      const messages = errors.map(error => Object.values(error.constraints || {})).flat();
      throw new BadRequestException(messages);
    }
    
    // Log temporal para debuggear
    console.log('DTO transformado:', createProductDto);
    console.log('Archivo recibido:', file?.filename);
    
    return this.productsService.create(createProductDto, file);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productsService.findAll(pageNum, limitNum);
  }

  @Get(':id/image')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const imagePath = await this.productsService.getImage(id);
    res.sendFile(imagePath);
  }
}
