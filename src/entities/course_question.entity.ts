import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

@Entity('course_questions')
export class CourseQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { name: 'question', nullable: true })
  questions: string[];

  @Column('jsonb', { name: 'answer', nullable: true })
  answers: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.courseQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  @Exclude()
  course: Course;
}
