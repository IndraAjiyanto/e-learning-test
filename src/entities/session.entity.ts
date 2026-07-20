import { JoinColumn,
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
import { LogbookMentor } from './logbook_mentor.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'topik' })
  topic: string;

  @Column()
  sessionOrder: number;

  @Column({ name: 'tanggal' })
  date: Date;

  @Column({ name: 'lokasi' })
  location: string;

  @Column({ name: 'waktu_awal', type: 'time' })
  startTime: string;

  @Column({ name: 'waktu_akhir', type: 'time' })
  endTime: string;

  @Column({ name: 'akhir', default: false })
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

  @OneToMany(
    () => LogbookMentor,
    (logbookMentor) => logbookMentor.session,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @Exclude()
  logbookMentors: LogbookMentor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
