import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

export type VoucherType = 'free' | 'discount';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code_voucher: string;

  @Column({ type: 'enum', enum: ['free', 'discount'] })
  type: VoucherType;

  @Column({ type: 'float', nullable: true })
  percent?: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Course, (course) => course.voucher)
  @Exclude()
  courses: Course[];
}
