import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { Syllabus } from './syllabus.entity';
import { Exclude } from 'class-transformer';

export type FileType = 'video' | 'pdf' | 'ppt';

@Entity()
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  file: string;

  @Column({ nullable: true })
  driveFileId?: string;

  @Column({ nullable: true })
  originalFileName?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSizeBytes?: number | string;

  @Column({ nullable: true })
  durationSeconds?: string;

  @Column({ type: 'enum', enum: ['video', 'pdf', 'ppt'] })
  fileType: FileType;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Session, (session) => session.materials, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Exclude()
  @JoinColumn({ name: 'sessionId' })
  session?: Session;

  @ManyToOne(() => Syllabus, (syllabus) => syllabus.materials, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Exclude()
  @JoinColumn({ name: 'syllabusId' })
  syllabus?: Syllabus;
}
