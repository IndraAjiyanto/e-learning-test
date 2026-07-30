import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Installment } from './installment.entity';
import { Exclude } from 'class-transformer';
import { ProcessStatus } from './types/process-status';

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
