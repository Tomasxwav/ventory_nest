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
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { Delivery } from 'src/deliveries/entities/delivery.entity';
import { SalesOrderItem } from './sales-order-item.entity';

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', length: 50, unique: true })
  order_number: string;

  @Column({ name: 'client_id', type: 'int', nullable: true })
  client_id: number;

  @Column({ name: 'customer_name', length: 255 })
  customer_name: string;

  @Column({ name: 'customer_email', length: 255, nullable: true })
  customer_email: string;

  @Column({ name: 'customer_phone', length: 50, nullable: true })
  customer_phone: string;

  @Column({ name: 'customer_address', type: 'text', nullable: true })
  customer_address: string;

  @Column({ name: 'order_date', type: 'timestamp' })
  order_date: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: string; // pending, confirmed, in_progress, completed, cancelled

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Client, (client) => client.sales_orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => SalesOrderItem, (item) => item.sales_order, {
    cascade: true,
    eager: false,
  })
  items: SalesOrderItem[];

  @OneToMany(() => Delivery, (delivery) => delivery.sales_order)
  deliveries: Delivery[];
}
