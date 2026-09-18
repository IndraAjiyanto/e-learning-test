import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SyllabusAnswerTask } from './syllabus_answer_task.entity';

/** Komentar mentor atas sebuah jawaban tugas silabus. */
@Entity('syllabus_comment')
@Index('IDX_syllabus_comment_answer', ['answer'])
export class SyllabusComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  comment: string;

  @ManyToOne(() => SyllabusAnswerTask, (a) => a.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Exclude()
  answer: SyllabusAnswerTask;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
