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
import { Course } from './course.entity';
import { Payment } from './payment.entity';
import { Exclude } from 'class-transformer';

export type Month = 3 | 6 | 12;

@Entity()
export class Installment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  down_payment: number;

  @Column('jsonb')
  price: number[];

  @Column({ type: 'enum', enum: [3, 6, 12] })
  month: Month;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.installments, { onDelete: 'CASCADE' })
  @Exclude()
  course: Course;

  @OneToOne(() => Payment, (payments) => payments.installment, {
  onDelete: 'CASCADE',
  })
  @Exclude()
  payment: Payment;
}
