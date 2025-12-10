import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { ProductsModule } from './products/products.module';
import { Brand } from './brands/entities/brand.entity';
import { Category } from './categories/entities/category.entity';
import { Subcategory } from './subcategories/entities/subcategory.entity';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tmartinez',
      password: 'postgres',
      database: 'ventory_nest',
      entities: [Brand, Category, Subcategory, Product],
      synchronize: true,
    }),
    BrandsModule,
    CategoriesModule,
    SubcategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
