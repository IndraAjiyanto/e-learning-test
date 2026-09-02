import {
  BeforeInsert,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Attendance } from './attendance.entity';
import { Biodata } from './biodata.entity';
import { Portofolios } from './portofolios.entity';
import { Payment } from './payment.entity';
import { UserAnswer } from './user_answer.entity';
import { MentorBiodata } from './mentor_biodata.entity';
import { AnswerTask } from './answer_task.entity';
import { Logbook } from './logbook.entity';
import { Score } from './score.entity';
import { WeekProgress } from './week_progress.entity';
import { SessionProgress } from './session_progress.entity';
import { Certificates } from './certificate.entity';
import { UserCourse } from './user_course.entity';
import { MentorLogbook } from './mentor_logbook.entity';
import { QuizProgress } from './quiz_progress.entity';
import { Mentorings } from './mentoring.entity';
import { Registration } from './registration.entity';
import { Exclude } from 'class-transformer';

export type UserRole = 'super_admin' | 'admin' | 'user';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  profile: string | null;

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'user'],
    default: 'user',
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({ default: false, nullable: true })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpires: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  countdownQuiz: Date | null;

  @Column({ default: false, nullable: true })
  quizStart: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @OneToMany(() => Attendance, (attendance) => attendance.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  absent: Attendance[];

  @OneToMany(() => Logbook, (logbook) => logbook.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  logbook: Logbook[];

  @OneToMany(() => MentorLogbook, (mentor_logbook) => mentor_logbook.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  mentor_logbook: MentorLogbook[];

  @OneToMany(() => Portofolios, (portfolio) => portfolio.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  portfolio: Portofolios[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  payments: Payment[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  userAnswers: UserAnswer[];

  @OneToMany(() => AnswerTask, (answerTask) => answerTask.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  answer_task: AnswerTask[];

  @OneToMany(() => UserCourse, (userCourse) => userCourse.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  userCourses: UserCourse[];

  @OneToMany(() => Score, (score) => score.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  scores: Score[];

  @OneToMany(() => WeekProgress, (weekProgress) => weekProgress.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  weekProgress: WeekProgress[];

  @OneToMany(() => SessionProgress, (sessionProgress) => sessionProgress.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  sessionProgress: SessionProgress[];

  @OneToMany(() => QuizProgress, (quizProgress) => quizProgress.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  quizProgress: QuizProgress[];

  @OneToMany(() => Certificates, (certificate) => certificate.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  certificates: Certificates[];

  @OneToMany(() => Mentorings, (mentoring) => mentoring.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  mentoring: Mentorings[];

  @OneToMany(() => Registration, (registration) => registration.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  registrations: Registration[];

  @OneToOne(() => Biodata, (biodata) => biodata.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  biodata: Biodata;

  @OneToOne(() => MentorBiodata, (mentor_biodata) => mentor_biodata.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  mentor_biodata: MentorBiodata;
}
