import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { User } from './user.entity';
import { Answer } from './answer.entity';
import { Exclude } from 'class-transformer';

@Entity('user_answers')
export class UserAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.userAnswers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pertanyaanId' })
  @Exclude()
  question: Question;

  @ManyToOne(() => Answer, (answer) => answer.userAnswers, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({ name: 'jawabanId' })
  @Exclude()
  answer: Answer | null;

  @ManyToOne(() => User, (user) => user.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;
}

