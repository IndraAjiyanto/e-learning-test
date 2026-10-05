import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Syllabus } from './syllabus.entity';
import { Exclude } from 'class-transformer';

@Entity('syllabus_progresses')
export class SyllabusProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  quiz: boolean;

  @Column({ default: false })
  process: boolean;

  @ManyToOne(() => User, (user) => user.syllabusProgress, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  user: User;

  @ManyToOne(() => Syllabus, (syllabus) => syllabus.syllabusProgresses, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  syllabus: Syllabus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

