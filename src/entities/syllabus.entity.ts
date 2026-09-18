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
import { Course } from './course.entity';
import { SyllabusMaterial } from './syllabus_material.entity';
import { SyllabusAssignment } from './syllabus_assignment.entity';
import { SyllabusLogbook } from './syllabus_logbook.entity';
import { SyllabusProgress } from './syllabus_progress.entity';
import { Quiz } from './quiz.entity';

/**
 * Satu satuan belajar pada program non-bootcamp (SPL).
 *
 * Bedanya dengan `Session` bukan cuma nama:
 *  - induknya LANGSUNG `course`, tanpa lapisan `weeks`;
 *  - tidak punya `date`, `location`, `start_time`, `end_time` - empat kolom
 *    yang tidak pernah berarti untuk belajar mandiri;
 *  - tidak punya absensi maupun logbook mentor. Penyelesaian dicatat
 *    `SyllabusProgress.completedAt`, bukan kehadiran.
 *
 * Lihat docs/syllabus-table-plan.md.
 */
@Entity('syllabus')
@Unique('UQ_syllabus_course_order', ['course', 'order'])
@Index('IDX_syllabus_course', ['course', 'order'])
export class Syllabus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Urutan tampil, sekaligus urutan buka-kunci. Dijaga unik per program:
   * urutan ganda membuat "silabus sebelumnya" tidak terdefinisi - masalah
   * yang pada `Session` ditambal dengan mencari nilai terbesar yang lebih
   * kecil.
   */
  @Column({ name: 'order', type: 'int' })
  order: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_final', default: false })
  isFinal: boolean;

  @ManyToOne(() => Course, (course) => course.syllabus, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Exclude()
  course: Course;

  @OneToMany(() => SyllabusMaterial, (m) => m.syllabus, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  materials: SyllabusMaterial[];

  @OneToMany(() => SyllabusAssignment, (a) => a.syllabus, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  assignments: SyllabusAssignment[];

  @OneToMany(() => SyllabusLogbook, (l) => l.syllabus, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  logbooks: SyllabusLogbook[];

  /** Kuis silabus ini. Satu per silabus (keputusan pemilik 2026-09-18). */
  @OneToMany(() => Quiz, (quiz) => quiz.syllabus, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  quiz: Quiz[];

  @OneToMany(() => SyllabusProgress, (p) => p.syllabus, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  progresses: SyllabusProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
