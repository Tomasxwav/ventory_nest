import { Product } from 'src/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  product_id: number;

  @Column({ name: 'order_id', type: 'int' })
  order_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ name: 'unit_of_measure', length: 50 })
  unit_of_measure: string;

  @Column({
    name: 'received_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  received_quantity: number;

  @Column({
    name: 'factured_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  factured_quantity: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => PurchaseOrder, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  purchase_order: PurchaseOrder;
}
