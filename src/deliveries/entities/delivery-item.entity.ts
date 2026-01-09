import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';
import { Product } from '../../products/entities/product.entity';
import { SalesOrderItem } from 'src/sales-orders/entities/sales-order-item.entity';

@Entity('delivery_items')
export class DeliveryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'delivery_id', type: 'int' })
  delivery_id: number;

  @Column({ name: 'sales_order_item_id', type: 'int' })
  sales_order_item_id: number;

  @Column({ name: 'product_id', type: 'int' })
  product_id: number;

  @Column({ name: 'quantity_delivered', type: 'int' })
  quantity_delivered: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Delivery, (delivery) => delivery.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @ManyToOne(() => SalesOrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sales_order_item_id' })
  sales_order_item: SalesOrderItem;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
