import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { Product } from '../products/entities/product.entity';
import { Purchase } from '../purchases/entities/purchase.entity';
import { PurchaseOrderItem } from '../purchase-orders/entities/purchase-order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Product, Purchase, PurchaseOrderItem])],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
