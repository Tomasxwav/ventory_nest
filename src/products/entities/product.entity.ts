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
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { Subcategory } from '../../subcategories/entities/subcategory.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    name: 'unit_of_measure',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  unit_of_measure: string;

  @Column({ 
    type: 'varchar',
    length: 50,
    default: 'active',
    nullable: false,
  })
  status: string;

  @Column({ 
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  currency: string;

  @Column({ 
    name: 'suggested_sale_cost',
    type: 'decimal', 
    precision: 12, 
    scale: 4,
    nullable: true,
  })
  suggested_sale_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ unique: true, length: 100 })
  sku: string;

  @Column({ name: 'serial_number', unique: true, length: 255, nullable: true })
  serial_number: string;

  @Column({ name: 'allow_low_stock_limit', type: 'boolean', default: false })
  allow_low_stock_limit: boolean;

  @Column({ name: 'low_stock_threshold', type: 'int', nullable: true })
  low_stock_threshold: number;

  @Column({ name: 'brand_id' })
  brand_id: number;

  @Column({ name: 'category_id' })
  category_id: number;

  @Column({ name: 'subcategory_id' })
  subcategory_id: number;

  @Column({ length: 500, nullable: true })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Brand, (brand) => brand.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[];
}
