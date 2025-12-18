import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'serial_number', length: 255, nullable: true })
  serial_number: string;

  @Column({ name: 'inventory_id' })
  inventory_id: number;

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

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Inventory, (inventory) => inventory.items)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;
}
