import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
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

  @Column({ type: 'date', array: true })
  dueDates: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.installments, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  course: Course;

  @OneToMany(() => Payment, (payments) => payments.installment, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  payment: Payment[];
}
