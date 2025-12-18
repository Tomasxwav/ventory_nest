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
import { Product } from '../../products/entities/product.entity';
import { Item } from '../../items/entities/item.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: false })
  product_id: number;

  @Column({ name: 'purchase_id', type: 'int', nullable: false })
  purchase_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Purchase, (purchase) => purchase.inventories)
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @OneToMany(() => Item, (item) => item.inventory, {
    cascade: true,
    eager: false,
  })
  items: Item[];
}
