import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Answer } from './answer.entity';
import { UserAnswer } from './user_answer.entity';
import { Quiz } from './quiz.entity';
import { Exclude } from 'class-transformer';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionText: string;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @Exclude()
  quiz: Quiz;

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  answers: Answer[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.question, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  userAnswers: UserAnswer[];
}
