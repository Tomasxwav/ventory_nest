import { User } from 'src/users/entities/user.entity';
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
import { PurchaseRequestItem } from './purchase-request-item.entity';

export enum PurchaseRequestStatus {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CONVERTIDA = 'convertida',
}

export enum PurchaseRequestPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_number', length: 255, unique: true })
  request_number: string;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @Column({ name: 'request_date', type: 'timestamp' })
  request_date: Date;

  @Column({
    type: 'enum',
    enum: PurchaseRequestStatus,
    default: PurchaseRequestStatus.PENDIENTE,
  })
  status: PurchaseRequestStatus;

  @Column({
    type: 'enum',
    enum: PurchaseRequestPriority,
    default: PurchaseRequestPriority.MEDIA,
  })
  priority: PurchaseRequestPriority;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PurchaseRequestItem, (item) => item.purchase_request, {
    cascade: true,
    eager: true,
  })
  items: PurchaseRequestItem[];
}
