import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  @Index()
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'access_token', nullable: false, unique: true })
  @Index({ unique: true })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: false, unique: true })
  @Index({ unique: true })
  refreshToken: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_info', nullable: true })
  deviceInfo?: string;

  @Column({ nullable: true })
  browser?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  @Index()
  expiresAt: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
