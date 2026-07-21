import { JoinColumn,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { Course } from './course.entity';
import { Quiz } from './quiz.entity';
import { WeekProgress } from './week_progress.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Weeks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'week_number' })
  weekNumber: number;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'is_final', default: false })
  isFinal: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.weeks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session[];

  @OneToMany(() => WeekProgress, (progres_minggu) => progres_minggu.week, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  weekProgresses: WeekProgress[];

  @OneToMany(() => Quiz, (quiz) => quiz.weeks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  quiz: Quiz[];

  @ManyToOne(() => Course, (course) => course.weeks, { onDelete: 'CASCADE' })
  @Exclude()
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
