import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

export type InvoiceStatus = 'pending' | 'paid' | 'expired' | 'refunded';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Xendit & Identifier Fields ──
  @Column({ type: 'varchar', nullable: true })
  xendit_invoice_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  xendit_invoice_url: string | null;

  @Column({ type: 'varchar', nullable: true })
  xendit_payment_channel: string | null;

  /**
   * Dual-purpose: Nomor invoice internal dan external_id Xendit.
   * Satu sumber kebenaran yang sinkron dengan payments.no.
   */
  @Column({ type: 'varchar', nullable: true, unique: true })
  invoice_number: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'expired', 'refunded'],
    default: 'pending',
    nullable: true,
  })
  status: InvoiceStatus | null;

  // ── Financial Fields ──
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  promo: number | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
  })
  promo_code: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  subtotal: number | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
  })
  discount_amount: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  final_total: number | null;

  @Column({ type: 'varchar', nullable: true })
  payment_method: string | null;

  // ── Snapshot User (saat checkout) ──
  @Column({ type: 'varchar', nullable: true })
  user_fullname: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_email: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_phone: string | null;

  // ── Snapshot Program (saat checkout) ──
  @Column({ type: 'varchar', nullable: true })
  course_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  category_name: string | null;

  // ── Bukti Transfer (Opsional jika upload manual) ──
  @Column({ type: 'varchar', nullable: true })
  proof_url: string | null;

  // ── Timestamps ──
  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expired_at: Date | null;

  // ── Refund (Disiapkan untuk kebutuhan mendatang) ──
  @Column({ type: 'timestamp', nullable: true })
  refund_at: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  refund_amount: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ──
  @OneToOne(() => Payment, (payment) => payment.invoice, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToOne(() => Course, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;
}
