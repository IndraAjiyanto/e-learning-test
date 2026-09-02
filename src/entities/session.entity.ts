import {
  JoinColumn,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Material } from './materials.entity';
import { Assignment } from './assignment.entity';
import { Weeks } from './weeks.entity';
import { SessionProgress } from './session_progress.entity';
import { Logbook } from './logbook.entity';
import { MentorLogbook } from './mentor_logbook.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'topic', nullable: true })
  topic: string;

  @Column({ nullable: true })
  sessionOrder: number;

  @Column({ name: 'date', nullable: true })
  date: Date;

  @Column({ name: 'location', nullable: true })
  location: string;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  @Column({ name: 'is_final', default: false })
  isFinal: boolean;

  @OneToMany(() => Attendance, (attendance) => attendance.session, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  attendances: Attendance[];

  @OneToMany(() => Material, (material) => material.session, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  materials: Material[];

  @OneToMany(() => Assignment, (assignment) => assignment.session, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  assignments: Assignment[];

  @ManyToOne(() => Weeks, (week) => week.session, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  weeks: Weeks;

  @OneToMany(
    () => SessionProgress,
    (sessionProgress) => sessionProgress.session,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @Exclude()
  sessionProgress: SessionProgress[];

  @OneToMany(() => Logbook, (logbook) => logbook.session, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  logbooks: Logbook[];

  @OneToMany(() => MentorLogbook, (logbookMentor) => logbookMentor.session, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  logbookMentors: MentorLogbook[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
