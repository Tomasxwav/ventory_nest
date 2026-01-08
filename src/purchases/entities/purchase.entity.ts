import { PurchaseOrder } from 'src/purchase-orders/entities/purchase-order.entity';
import { Item } from 'src/items/entities/item.entity';
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

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'purchase_order_id', type: 'int', nullable: true })
  purchase_order_id: number;

  @Column({ length: 255 })
  voucher: string;

  @Column({ length: 255 })
  invoice: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => PurchaseOrder, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchase_order_id' })
  purchase_order: PurchaseOrder;

  @OneToMany(() => Item, (item) => item.purchase, {
    cascade: true,
    eager: false,
  })
  items: Item[];
}