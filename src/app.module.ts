import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchasesModule } from './purchases/purchases.module';
import { Brand } from './brands/entities/brand.entity';
import { Category } from './categories/entities/category.entity';
import { Subcategory } from './subcategories/entities/subcategory.entity';
import { Product } from './products/entities/product.entity';
import { Inventory } from './inventory/entities/inventory.entity';
import { Item } from './items/entities/item.entity';
import { User } from './users/entities/user.entity';
import { Session } from './sessions/entities/session.entity';
import { Suppliers } from './suppliers/entities/suppliers.entity';
import { Purchase } from './purchases/entities/purchase.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tmartinez',
      password: 'postgres',
      database: 'ventory_nest',
      entities: [Brand, Category, Subcategory, Product, Inventory, Item, User, Session, Suppliers, Purchase],
      synchronize: true,
    }),
    BrandsModule,
    CategoriesModule,
    SubcategoriesModule,
    ProductsModule,
    InventoryModule,
    ItemsModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    SuppliersModule,
    PurchasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
