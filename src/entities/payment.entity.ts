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

  @Column({name:'user_email', nullable: true })
  userEmail: string;

  @Column({name:'user_name', nullable:true})
  userName: string;

  @Column({ name:'course_name', nullable:true})
  courseName:string;

  @Column({name:'voucher_code', nullable:true})
  voucherCode:string;

  @Column({type:'decimal', precision: 12, scale: 2,
  nullable:true})
  subtotal: number;

  @Column({ type:'decimal', precision: 12, scale:2,
  nullable:true, default: 0})
  discount_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2,
  nullable:true})
  final_total: number;

  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending_payment', 'paid', 'expired', 'failed'],
    default: 'draft',
    nullable: true
  })
  payment_status: string;

  @Column({ nullable: true })
  xendit_invoice_id: string;

  @Column({ nullable: true })
  xendit_invoice_url: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

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
