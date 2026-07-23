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

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.scores, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.scores, { onDelete: 'CASCADE' })
  @Exclude()
  quiz: Quiz;
}
