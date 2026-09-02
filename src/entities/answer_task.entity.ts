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
import { ProcessStatus } from './types/process-status';

@Entity()
export class AnswerTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  file: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    default: 'rejected',
  })
  process: ProcessStatus;

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
