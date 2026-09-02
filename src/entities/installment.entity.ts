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

export type Month = 3;

@Entity()
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  downPayment: number;

  @Column('jsonb')
  price: number[];

  @Column({ type: 'enum', enum: [3] })
  month: Month;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.installments, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  course: Course;

  @OneToOne(() => Payment, (payments) => payments.installment, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  payment: Payment;
}
