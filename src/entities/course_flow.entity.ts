import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class CourseFlow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sequence: number;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  content: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.courseFlow, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  course: Course;
}
