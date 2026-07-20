import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Weeks } from './weeks.entity';
import { Exclude } from 'class-transformer';

@Entity('week_progresses')
export class WeekProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  quiz: boolean;

  @Column({ default: false })
  process: boolean;

  @ManyToOne(() => User, (user) => user.weekProgress, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Weeks, (weeks) => weeks.weekProgresses, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  week: Weeks;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
