import {
  Index,
  JoinColumn,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { Score } from './score.entity';
import { Weeks } from './weeks.entity';
import { Course } from './course.entity';
import { QuizProgress } from './quiz_progress.entity';
import { Exclude } from 'class-transformer';

@Entity()
@Index('IDX_quiz_course', ['course'])
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_name' })
  quizName: string;

  @Column({ name: 'minimum_score' })
  minScore: number;

  @Column({ name: 'duration', type: 'int' })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  questions: Question[];

  @OneToMany(() => Score, (score) => score.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  scores: Score[];

  @OneToMany(() => QuizProgress, (quizProgress) => quizProgress.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  quizProgresses: QuizProgress[];

  /**
   * Kuis tingkat program, dipakai non-bootcamp. Tanpa lapisan `weeks`, kuis
   * SPL tidak punya rumah - kolom ini rumahnya. Nullable: kuis bootcamp tetap
   * menempel di minggu lewat `weeks` di bawah dan tidak menyentuh kolom ini.
   */
  @ManyToOne(() => Course, (course) => course.quiz, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'courseId' })
  @Exclude()
  course: Course | null;

  @ManyToOne(() => Weeks, (week) => week.quiz, { onDelete: 'CASCADE' })
  @Exclude()
  weeks: Weeks;
}
