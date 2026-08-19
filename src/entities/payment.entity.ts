import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Installment } from './installment.entity';
import { Invoice } from './invoice.entity';
import { Exclude } from 'class-transformer';
import { ProcessStatus } from './types/process-status';

export type currentStatus = 'University Student'| 'Fresh Graduate'| 'Job Seeker'| 'Employee'| 'Freelancer'| 'Entrepreneur'| 'Other';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  file: string;

  @Column({ nullable: true })
  no: string;

  @Column({
    type: 'enum',
    enum: ['Instagram', 'TikTok', 'LinkedIn', 'Friends', 'University', 'WhatsApp Group', 'Webinar/Event', 'Website', 'Other'],
    nullable: true,
  })
  referalSource: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    default: 'rejected',
  })
  process: ProcessStatus;

  @Column({
    type:'enum',
    enum:['University Student', 'Fresh Graduate', 'Job Seeker', 'Employee', 'Freelancer', 'Entrepreneur', 'Other'],
    nullable:true,
  })
  current_status: currentStatus;

  @Column({nullable:true,})
  attend_program: boolean;

  @OneToOne(() => Invoice, (invoice) => invoice.payment)
  invoice: Invoice;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @ManyToOne(() => Course, (course) => course.payments, { onDelete: 'CASCADE' })
  @Exclude()
  course: Course;

  @OneToOne(() => Installment, (installment) => installment.payment)
  @JoinColumn()
  @Exclude()
  installment: Installment;
}
