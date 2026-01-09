import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { ProductsModule } from './products/products.module';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchasesModule } from './purchases/purchases.module';
import { PurchaseRequestsModule } from './purchase-requests/purchase-requests.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { Brand } from './brands/entities/brand.entity';
import { Category } from './categories/entities/category.entity';
import { Subcategory } from './subcategories/entities/subcategory.entity';
import { Product } from './products/entities/product.entity';
import { ProductCategory } from './products/entities/product-category.entity';
import { ProductSubcategory } from './products/entities/product-subcategory.entity';
import { Item } from './items/entities/item.entity';
import { User } from './users/entities/user.entity';
import { Session } from './sessions/entities/session.entity';
import { Suppliers } from './suppliers/entities/suppliers.entity';
import { Purchase } from './purchases/entities/purchase.entity';
import { PurchaseRequest } from './purchase-requests/entities/purchase-request.entity';
import { PurchaseRequestItem } from './purchase-requests/entities/purchase-request-item.entity';
import { PurchaseOrder } from './purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from './purchase-orders/entities/purchase-order-item.entity';
import { SalesOrder } from './sales-orders/entities/sales-order.entity';
import { SalesOrderItem } from './sales-orders/entities/sales-order-item.entity';
import { Client } from './clients/entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tmartinez',
      password: 'postgres',
      database: 'ventory_nest',
      entities: [
        Brand,
        Category,
        Subcategory,
        Product,
        ProductCategory,
        ProductSubcategory,
        Item,
        User,
        Session,
        Suppliers,
        Purchase,
        PurchaseRequest,
        PurchaseRequestItem,
        PurchaseOrder,
        PurchaseOrderItem,
        SalesOrder,
        SalesOrderItem,
        Client,
      ],
      synchronize: true,
    }),
    BrandsModule,
    CategoriesModule,
    SubcategoriesModule,
    ProductsModule,
    ItemsModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    SuppliersModule,
    PurchasesModule,
    PurchaseRequestsModule,
    PurchaseOrdersModule,
    SalesOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
