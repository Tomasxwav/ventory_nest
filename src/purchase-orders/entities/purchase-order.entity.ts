import { User } from 'src/users/entities/user.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  COMPLETA = 'completa',
  CANCELADA = 'cancelada',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', length: 255, unique: true })
  order_number: string;

  @Column({ name: 'purchase_request_id', type: 'int', nullable: true })
  purchase_request_id: number;

  @Column({ name: 'supplier_id', type: 'int' })
  supplier_id: number;

  @Column({ length: 10, default: 'MXN' })
  currency: string;

  @Column({ name: 'expected_date', type: 'timestamp', nullable: true })
  expected_date: Date;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDIENTE,
  })
  status: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'created_by_id', type: 'int' })
  created_by_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => PurchaseRequest, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchase_request_id' })
  purchase_request: PurchaseRequest;

  @ManyToOne(() => Suppliers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Suppliers;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchase_order, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];
}
