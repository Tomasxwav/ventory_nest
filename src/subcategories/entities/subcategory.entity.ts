import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ name: 'category_id' })
  category_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Product, (product) => product.subcategory)
  products: Product[];
}
