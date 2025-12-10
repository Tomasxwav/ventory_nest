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
  serialNumber: string;

  @Column({ name: 'inventory_id' })
  inventoryId: number;

  @Column({
    name: 'purchase_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
  })
  purchaseCost: number;

  @Column({
    name: 'sale_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
  })
  saleCost: number;

  @Column({
    name: 'purchase_currency',
    type: 'varchar',
    length: 10,
    default: 'mxn',
    nullable: false,
  })
  purchaseCurrency: string;

  @Column({
    name: 'sale_currency',
    type: 'varchar',
    length: 10,
    default: 'mxn',
    nullable: false,
  })
  saleCurrency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Inventory, (inventory) => inventory.items)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;
}
