import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesOrder } from './sales-order.entity';
import { Product } from '../../products/entities/product.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('sales_order_items')
export class SalesOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sales_order_id', type: 'int' })
  sales_order_id: number;

  @Column({ name: 'product_id', type: 'int' })
  product_id: number;

  @Column({ name: 'item_id', type: 'int', nullable: true })
  item_id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sales_order_id' })
  sales_order: SalesOrder;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Si el producto es serializado, se vincula a un Item específico
  // Si no es serializado, item_id es null y solo se usa quantity
  @ManyToOne(() => Item, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
