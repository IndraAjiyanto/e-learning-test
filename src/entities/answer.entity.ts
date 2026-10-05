import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { UserAnswer } from './user_answer.entity';
import { Exclude } from 'class-transformer';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  answer: string;

  @Column({ default: false })
  isCorrect: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  @Exclude()
  question: Question;

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.answer, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  userAnswers: UserAnswer[];
}
