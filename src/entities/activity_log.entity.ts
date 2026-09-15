import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

export type ActivityEventType = 'login' | 'logout' | 'expired';

@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.activityLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @Column({
    type: 'enum',
    enum: ['login', 'logout', 'expired'],
  })
  eventType: ActivityEventType;

  @Column({ type: 'timestamp' })
  eventAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}