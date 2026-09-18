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
import { Syllabus } from './syllabus.entity';
import { QuizProgress } from './quiz_progress.entity';
import { Exclude } from 'class-transformer';

@Entity()
@Index('IDX_quiz_syllabus', ['syllabus'])
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
   * Kuis milik satu SILABUS (program non-bootcamp). Nullable: kuis bootcamp
   * menempel di minggu lewat `weeks` di bawah dan tidak menyentuh kolom ini.
   *
   * Sempat berupa `courseId` (satu kuis per program) waktu pertanyaannya belum
   * terjawab; pemilik memutuskan satu kuis per silabus - lihat migrasi
   * 1788900000000.
   */
  @ManyToOne(() => Syllabus, (syllabus) => syllabus.quiz, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'syllabusId' })
  @Exclude()
  syllabus: Syllabus | null;

  @ManyToOne(() => Weeks, (week) => week.quiz, { onDelete: 'CASCADE' })
  @Exclude()
  weeks: Weeks;
}
