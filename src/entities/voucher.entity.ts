import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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
  percent?: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Satu voucher bisa berlaku untuk banyak program (kelas).
  // @JoinTable ada di sini (sisi "owning") → TypeORM membuat tabel junction
  // bernama "voucher_programs" dengan kolom voucherId dan courseId.
  @ManyToMany(() => Course, (course) => course.vouchers)
  @JoinTable({
    name: 'voucher_programs',
    joinColumn: { name: 'voucherId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'courseId', referencedColumnName: 'id' },
  })
  @Exclude()
  courses: Course[];
}
