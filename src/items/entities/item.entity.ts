import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { PurchaseOrderItem } from '../../purchase-orders/entities/purchase-order-item.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'serial_number', length: 255, nullable: true })
  serial_number: string;

  @Column({ name: 'product_id', type: 'int' })
  product_id: number;

  @Column({ name: 'purchase_id', type: 'int', nullable: true })
  purchase_id: number;

  @Column({ name: 'purchase_order_item_id', type: 'int', nullable: true })
  purchase_order_item_id: number;

  @Column({
    name: 'purchase_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
  })
  purchase_cost: number;

  @Column({
    name: 'sale_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
  })
  sale_cost: number;

  @Column({
    name: 'purchase_currency',
    type: 'varchar',
    length: 10,
    default: 'mxn',
    nullable: false,
  })
  purchase_currency: string;

  @Column({
    name: 'sale_currency',
    type: 'varchar',
    length: 10,
    default: 'mxn',
    nullable: false,
  })
  sale_currency: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'available',
    nullable: false,
  })
  status: string; // available, reserved, sold

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Purchase, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ManyToOne(() => PurchaseOrderItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchase_order_item_id' })
  purchase_order_item: PurchaseOrderItem;
}
