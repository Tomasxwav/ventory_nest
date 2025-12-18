import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';
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

  @Column({ length: 255 })
  voucher: string;

  @Column({ length: 255 })
  invoice: string;

  @Column({ name: 'supplier_id', type: 'int', nullable: false })
  supplier_id: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Suppliers, (supplier) => supplier.purchases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Suppliers;

  @OneToMany(() => Inventory, (inventory) => inventory.purchase, {
    cascade: true,
    eager: false,
  })
  inventories: Inventory[];
}