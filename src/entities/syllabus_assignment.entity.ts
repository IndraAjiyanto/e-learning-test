import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Syllabus } from './syllabus.entity';
import { SyllabusAnswerTask } from './syllabus_answer_task.entity';

/** Tugas milik satu silabus. */
@Entity('syllabus_assignment')
@Index('IDX_syllabus_assignment_syllabus', ['syllabus'])
export class SyllabusAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  file: string;

  @ManyToOne(() => Syllabus, (s) => s.assignments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Exclude()
  syllabus: Syllabus;

  @OneToMany(() => SyllabusAnswerTask, (a) => a.task, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  taskAnswers: SyllabusAnswerTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
