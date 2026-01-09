import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subcategory } from '../../subcategories/entities/subcategory.entity';
import { ProductCategory } from '../../products/entities/product-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category)
  subcategories: Subcategory[];

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.category)
  productCategories: ProductCategory[];
}
