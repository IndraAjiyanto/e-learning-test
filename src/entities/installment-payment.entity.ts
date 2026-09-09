import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity('installment_payments')
export class InstallmentPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payment, (payment) => payment.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column()
  month: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  no: string;

  @Column({ nullable: true })
  xendit_invoice_id: string;

  @Column({ nullable: true })
  xendit_invoice_url: string;

  @Column({ type: 'enum', enum: ['process', 'approved', 'rejected'], default: 'process' })
  status: 'process' | 'approved' | 'rejected';

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
