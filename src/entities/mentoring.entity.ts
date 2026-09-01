import {
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

@Entity('mentoring')
export class Mentorings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.mentoring, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Course, (course) => course.mentorings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  @Exclude()
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
