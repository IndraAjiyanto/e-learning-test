import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SyllabusAssignment } from './syllabus_assignment.entity';
import { SyllabusComment } from './syllabus_comment.entity';
import { User } from './user.entity';
import { ProcessStatus } from './types/process-status';

/**
 * Jawaban student atas satu tugas silabus.
 *
 * `UQ (task, user)` sengaja ada: satu student satu jawaban per tugas. Padanan
 * lamanya (`AnswerTask`) tidak punya penjagaan ini, dan alur "Edit Submission"
 * mengandalkan jawaban pertama yang kebetulan ditemukan.
 */
@Entity('syllabus_answer_task')
@Unique('UQ_syllabus_answer_task_task_user', ['task', 'user'])
@Index('IDX_syllabus_answer_task_user', ['user'])
export class SyllabusAnswerTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  file: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    enumName: 'answer_task_process_enum',
    default: 'rejected',
  })
  process: ProcessStatus;

  @ManyToOne(() => SyllabusAssignment, (t) => t.taskAnswers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Exclude()
  task: SyllabusAssignment;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @Exclude()
  user: User;

  @OneToMany(() => SyllabusComment, (c) => c.answer, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  comments: SyllabusComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
