import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  file: string;

  @Column({
    type: 'enum',
    enum: ['acc', 'proces', 'rejected'],
    default: 'rejected',
  })
  process: Proses;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @ManyToOne(() => Course, (course) => course.registrations, { onDelete: 'CASCADE' })
  @Exclude()
  course: Course;
}
