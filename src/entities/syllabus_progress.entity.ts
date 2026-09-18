import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Syllabus } from './syllabus.entity';
import { User } from './user.entity';

/**
 * Kemajuan seorang student pada satu silabus.
 *
 * MENGGANTIKAN absensi, bukan menirunya. Student yang belajar mandiri tidak
 * "hadir" - ia MENYELESAIKAN. Karena itu `completedAt`, bukan `isAttended`.
 *
 * `UQ (syllabus, user)` sengaja ada: `session_progresses` tidak punya
 * penjagaan ini, dan kodenya menambal dengan pola upsert manual di lima
 * tempat berbeda.
 */
@Entity('syllabus_progress')
@Unique('UQ_syllabus_progress_syllabus_user', ['syllabus', 'user'])
@Index('IDX_syllabus_progress_user', ['user'])
export class SyllabusProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Diisi saat student menandai silabusnya selesai. NULL = belum selesai. */
  @Column({ name: 'completedAt', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  /** Hanya berarti pada program yang logbooknya menyala. */
  @Column({ name: 'logbookOk', default: false })
  logbookOk: boolean;

  @ManyToOne(() => Syllabus, (s) => s.progresses, {
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
