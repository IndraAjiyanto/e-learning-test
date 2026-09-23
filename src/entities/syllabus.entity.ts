import {
  JoinColumn,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Quiz } from './quiz.entity';
import { SyllabusProgress } from './syllabus_progress.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Syllabus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'syllabusNumber' })
  syllabusNumber: number;

  @Column()
  description: string;

  @Column('jsonb', { nullable: true })
  content: object;

  @Column({ name: 'isFinal', default: false })
  isFinal: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => SyllabusProgress,
    (syllabusProgress) => syllabusProgress.syllabus,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @Exclude()
  syllabusProgresses: SyllabusProgress[];

  @OneToMany(() => Quiz, (quiz) => quiz.syllabus, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  quiz: Quiz[];

  @ManyToOne(() => Course, (course) => course.syllabus, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  @JoinColumn({ name: 'courseId' })
  course: Course;
}

