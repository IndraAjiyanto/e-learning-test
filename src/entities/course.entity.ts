import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Portofolios } from './portofolios.entity';
import { Category } from './category.entity';
import { Payment } from './payment.entity';
import { Weeks } from './weeks.entity';
import { Certificates } from './certificate.entity';
import { CourseType } from './course_type.entity';
import { UserCourse } from './user_course.entity';
import { CourseQuestions } from './course_question.entity';
import { Mentors } from './mentor.entity';
import { Alumni } from './alumni.entity';
import { Installment } from './installment.entity';
import { Technology } from './technology.entity';
import { CourseFlow } from './course_flow.entity';
import { ProgramBenefits } from './course_benefit.entity';
import { Participants } from './participants.entity';
import { Mentorings } from './mentoring.entity';
import { Registration } from './registration.entity';
import { Voucher } from './voucher.entity';
import { Syllabus } from './syllabus.entity';
import { FinalAssignment } from './final_assignment.entity';
import { Exclude } from 'class-transformer';
import { ProcessStatus } from './types/process-status';

export type Method = 'online' | 'offline';

/**
 * Bentuk belajar sebuah program. Bukan nama program dan bukan harganya -
 * keduanya diurus `category` (lihat docs/program-type-plan.md bagian 1.4).
 *
 * - bootcamp     : minggu, tiap minggu berisi beberapa sesi, kuis per minggu.
 * - non_bootcamp : silabus datar (SPL). Dipakai Starter Class dan Faster Class;
 *                  keduanya hanya beda harga, jadi tidak perlu nilai sendiri.
 * - lpk          : Japan Pathway. Hari ini sama dengan bootcamp; yang
 *                  membedakan pendampingnya (sensei), lihat program-type.ts.
 */
export type ProgramType = 'bootcamp' | 'non_bootcamp' | 'lpk';
export const PROGRAM_TYPES: ProgramType[] = ['bootcamp', 'non_bootcamp', 'lpk'];

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('jsonb', { nullable: true })
  description: { id: string; en: string; ja: string };

  @Column()
  group: string;

  @Column()
  image: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  promo: number;

  @Column({ nullable: true })
  locationLink: string;

  @Column('jsonb', { nullable: true })
  locations: { id: string; en: string; ja: string };

  @Column({ type: 'enum', enum: ['online', 'offline'] })
  method: Method;

  @Column('jsonb', { nullable: true })
  criteriaId: string[];

  @Column('jsonb', { nullable: true })
  criteriaEn: string[];

  @Column('jsonb', { nullable: true })
  criteriaJa: string[];

  @Column({ default: false })
  launch: boolean;

  @Column({ nullable: true })
  date_registration: Date;

  /** Lihat ProgramType. Program lama otomatis 'bootcamp' lewat default. */
  @Column({
    name: 'program_type',
    type: 'enum',
    enum: PROGRAM_TYPES,
    default: 'bootcamp',
  })
  programType: ProgramType;

  /**
   * Logbook bisa dimatikan per program. HANYA berlaku untuk program yang
   * `logbookConfigurable`-nya true (non_bootcamp) - lihat program-type.ts.
   *
   * PENTING: mematikan kolom ini juga melonggarkan syarat buka-kunci sesi.
   * Tanpa itu, `session_progresses.logbook` tidak pernah terisi dan sesi kedua
   * dan seterusnya terkunci selamanya. Lihat sessionUnlock.logbookApproved.
   */
  @Column({ name: 'logbook_enabled', default: true })
  logbookEnabled: boolean;

  @ManyToMany(() => Technology, (technologies) => technologies.course)
  @JoinTable({
    name: 'course_technologies',
    joinColumn: { name: 'courseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'technologyId', referencedColumnName: 'id' },
  })
  @Exclude()
  technologies: Technology[];

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    default: 'rejected',
  })
  process: ProcessStatus;

  @Column('jsonb', { nullable: true })
  materialsId: string[];

  @Column('jsonb', { nullable: true })
  materialsEn: string[];

  @Column('jsonb', { nullable: true })
  materialsJa: string[];

  @Column('jsonb', { nullable: true })
  learningTargetsId: string[];

  @Column('jsonb', { nullable: true })
  learningTargetsEn: string[];

  @Column('jsonb', { nullable: true })
  learningTargetsJa: string[];

  @Column({ nullable: true })
  quota: number;

  @Column({ nullable: true })
  form: string;

  @Column({ default: false })
  checkPaid: boolean;

  @Column({ nullable: true })
  month: number;

  @Column({ nullable: true })
  day: number;

  @Column()
  startDate: Date;

  @Column()
  startEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserCourse, (user_course) => user_course.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  userCourses: UserCourse[];

  // Diisi hanya oleh query yang memakai loadRelationCountAndMap('course.enrolledCount').
  // Bukan kolom tabel, jadi tidak ada @Column di sini.
  enrolledCount?: number;

  @OneToMany(() => Mentorings, (mentoring) => mentoring.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  mentorings: Mentorings[];

  @OneToMany(() => Weeks, (weeks) => weeks.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  weeks: Weeks[];

  @OneToMany(() => Syllabus, (syllabus) => syllabus.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  syllabus: Syllabus[];

  @OneToOne(() => FinalAssignment, (finalAssignment) => finalAssignment.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  finalAssignment: FinalAssignment;

  @OneToMany(() => Alumni, (alumni) => alumni.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  alumni: Alumni[];

  @OneToMany(() => Portofolios, (portofolios) => portofolios.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  portofolios: Portofolios[];

  @OneToMany(() => Payment, (payments) => payments.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  payments: Payment[];

  @ManyToOne(() => Category, (category) => category.courses, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  category: Category;

  // SET NULL, bukan CASCADE: begitu CourseType resmi jadi Tag yang bebas
  // dibuat dan dihapus admin, CASCADE berarti menghapus tag ikut menghapus
  // setiap program yang memakainya. Kolomnya memang sudah nullable.
  @ManyToOne(() => CourseType, (course_type) => course_type.classes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'courseTypeId' })
  @Exclude()
  courseType: CourseType;

  @OneToMany(() => Certificates, (certificates) => certificates.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  certificates: Certificates[];

  @OneToMany(
    () => CourseQuestions,
    (course_questions) => course_questions.course,
  )
  @Exclude()
  courseQuestions: CourseQuestions[];

  @OneToMany(() => Mentors, (mentors) => mentors.course)
  @Exclude()
  mentors: Mentors[];

  @OneToMany(() => Installment, (installment) => installment.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  installments: Installment[];

  @OneToMany(() => CourseFlow, (courseFlow) => courseFlow.course)
  @Exclude()
  courseFlow: CourseFlow[];

  @OneToMany(() => ProgramBenefits, (programBenefits) => programBenefits.course)
  @Exclude()
  programBenefits: ProgramBenefits[];

  @OneToMany(() => Participants, (participants) => participants.course)
  @Exclude()
  participants: Participants[];

  @OneToMany(() => Registration, (registrations) => registrations.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  registrations: Registration[];

  // Sisi inverse dari ManyToMany — @JoinTable ada di voucher.entity.ts
  @ManyToMany(() => Voucher, (voucher) => voucher.courses)
  @Exclude()
  vouchers: Voucher[];

  @Column({ name: 'time_start', nullable: true, type: 'time' })
  time_start: string;

  @Column({ name: 'time_end', nullable: true, type: 'time' })
  time_end: string;
}
