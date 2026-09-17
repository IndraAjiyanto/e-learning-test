import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity('user_activity')
@Unique(['userId'])
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.userActivities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @Column({ type: 'varchar', nullable: true })
  sessionId: string | null;

  @Column({ type: 'timestamp' })
  loginAt: Date;

  @Column({ type: 'timestamp' })
  lastSeenAt: Date;

  @Column({ type: 'uuid', nullable: true })
  currentCourseId: string | null;

  @Column({ type: 'varchar', nullable: true })
  activityLabel: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
