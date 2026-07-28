import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Quiz } from './quiz.entity';
import { Exclude } from 'class-transformer';

@Entity('quiz_progresses')
export class QuizProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  process: boolean;

  @ManyToOne(() => User, (user) => user.quizProgress, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.quizProgresses, { onDelete: 'CASCADE' })
  @Exclude()
  quiz: Quiz;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
