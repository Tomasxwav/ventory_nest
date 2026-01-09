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
import { Delivery } from '../../deliveries/entities/delivery.entity';
import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invoice_number', length: 50, unique: true })
  invoice_number: string;

  @Column({ name: 'delivery_id', type: 'int' })
  delivery_id: number;

  @Column({ name: 'invoice_date', type: 'timestamp' })
  invoice_date: Date;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: string; // pending, paid, overdue, cancelled

  @Column({ name: 'payment_method', length: 100, nullable: true })
  payment_method: string;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  payment_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_rate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount_paid: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance_due: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Delivery, (delivery) => delivery.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: false,
  })
  items: InvoiceItem[];
}
