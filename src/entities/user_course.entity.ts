import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

@Entity('user_courses')
export class UserCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'progress', default: false })
  progress: boolean;

  @ManyToOne(() => User, (user) => user.userCourses, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Course, (course) => course.userCourses, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  course: Course;
}
