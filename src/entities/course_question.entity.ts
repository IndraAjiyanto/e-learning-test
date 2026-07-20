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

@Entity('pertanyaan_kelas')
export class CourseQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { name: 'pertanyaan', nullable: true })
  questions: string[];

  @Column('jsonb', { name: 'jawaban', nullable: true })
  answers: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.courseQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kelasId' })
  @Exclude()
  course: Course;
}
