import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SalesOrder } from '../../sales-orders/entities/sales-order.entity';
import { User } from '../../users/entities/user.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { DeliveryItem } from './delivery-item.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'delivery_number', length: 50, unique: true })
  delivery_number: string;

  @Column({ name: 'sales_order_id', type: 'int' })
  sales_order_id: number;

  @Column({ name: 'delivery_date', type: 'timestamp' })
  delivery_date: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: string; // pending, in_transit, delivered, cancelled

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  delivery_address: string;

  @Column({ name: 'tracking_number', length: 100, nullable: true })
  tracking_number: string;

  @Column({ name: 'carrier', length: 100, nullable: true })
  carrier: string;

  @Column({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true })
  estimated_delivery_date: Date;

  @Column({ name: 'actual_delivery_date', type: 'timestamp', nullable: true })
  actual_delivery_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.deliveries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sales_order_id' })
  sales_order: SalesOrder;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DeliveryItem, (item) => item.delivery, {
    cascade: true,
    eager: false,
  })
  items: DeliveryItem[];

  @OneToMany(() => Invoice, (invoice) => invoice.delivery)
  invoices: Invoice[];
}
