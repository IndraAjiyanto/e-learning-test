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
import { Syllabus } from './syllabus.entity';
import { User } from './user.entity';
import { ProcessStatus } from './types/process-status';

/**
 * Logbook student pada satu silabus.
 *
 * Catatan: logbook punya sakelar per program (`course.logbook_enabled`) dan
 * pada SPL biasanya mati, jadi tabel ini kemungkinan besar kosong untuk
 * sementara. Itu konsekuensi yang diterima dari pemisahan penuh.
 */
@Entity('syllabus_logbook')
@Index('IDX_syllabus_logbook_user', ['user', 'syllabus'])
export class SyllabusLogbook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  activity: string;

  @Column({ name: 'activity_details', nullable: true })
  activityDetails: string;

  @Column({ nullable: true })
  documentation: string;

  @Column({ nullable: true })
  obstacles: string;

  @Column({ name: 'other_documentation', nullable: true })
  otherDocumentation: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    enumName: 'logbook_process_enum',
    default: 'rejected',
  })
  process: ProcessStatus;

  @ManyToOne(() => Syllabus, (s) => s.logbooks, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Exclude()
  syllabus: Syllabus;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @Exclude()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
