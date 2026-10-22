import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';
import { ProcessStatus } from './types/process-status';
import { REFERAL_SOURCES } from './types/referal-source';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  file: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    default: 'rejected',
  })
  process: ProcessStatus;

  @Column({ nullable: true })
  user_fullname: string;

  @Column({ nullable: true })
  user_email: string;

  @Column({ nullable: true })
  user_no: string;

  @Column({
    type: 'enum',
    enum: [
      'University Student',
      'Fresh Graduate',
      'Job Seeker',
      'Employee',
      'Freelancer',
      'Entrepreneur',
      'Other',
    ],
    nullable: true,
  })
  current_status: string;

  @Column({ nullable: true })
  attend_program: boolean;

  // Sama seperti Payment.referalSource: satu konstanta untuk kedua kolom enum
  // yang harus nilainya sama, `registrations_referal_source_enum`.
  @Column({
    type: 'enum',
    enum: REFERAL_SOURCES,
    nullable: true,
  })
  referal_source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @ManyToOne(() => Course, (course) => course.registrations, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  course: Course;
}
