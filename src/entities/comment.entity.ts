import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnswerTask } from './answer_task.entity';
import { Exclude } from 'class-transformer';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  komentar: string;

  @ManyToOne(() => AnswerTask, (answerTask) => answerTask.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_answerId' })
  @Exclude()
  answer_task: AnswerTask;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
