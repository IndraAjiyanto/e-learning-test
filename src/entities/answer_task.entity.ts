import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { Comment } from './comment.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

export type ProcessType = 'acc' | 'proces' | 'rejected';

@Entity()
export class AnswerTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file: string;

  @Column({
    type: 'enum',
    enum: ['acc', 'proces', 'rejected'],
    default: 'rejected',
  })
  process: ProcessType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Assignment, (task) => task.taskAnswers, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  task: Assignment;

  @OneToMany(() => Comment, (comment) => comment.answer_task, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  comment: Comment[];

  @ManyToOne(() => User, (user) => user.answer_task, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;
}
