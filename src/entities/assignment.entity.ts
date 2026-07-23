import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { AnswerTask } from './answer_task.entity';
import { Exclude } from 'class-transformer';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  file: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Session, (session) => session.assignments, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session;

  @OneToMany(() => AnswerTask, (answerTask) => answerTask.task, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  taskAnswers: AnswerTask[];
}
