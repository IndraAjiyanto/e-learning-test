import { JoinColumn,
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
import { QuizProgress } from './quiz_progress.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nama_quiz' })
  quizName: string;

  @Column({ name: 'nilai_minimal' })
  minScore: number;

  @Column({ name: 'durasi', type: 'int' })
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

  @ManyToOne(() => Weeks, (week) => week.quiz, { onDelete: 'CASCADE' })
  @Exclude()
  weeks: Weeks;
}
