import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Purchase } from '../../purchases/entities/purchase.entity';

@Entity('suppliers')
export class Suppliers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true  })
  website: string;

  @Column({ length: 255 })
  phone: string;

  @Column({ length: 255 })
  street: string;

  @Column({ length: 255, nullable: true })
  street_number: string;

  @Column({ length: 255, nullable: true })
  apartment: string;

  @Column({ length: 255, nullable: true })
  neighborhood: string;

  @Column({ length: 255 })
  city: string;

  @Column({ length: 255 })
  state: string;

  @Column({ length: 10 })
  postal_code: string;

  @Column({ length: 100 })
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Purchase, (purchase) => purchase.supplier)
  purchases: Purchase[];
}
