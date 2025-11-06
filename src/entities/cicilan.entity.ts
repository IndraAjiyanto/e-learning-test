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
import { Kelas } from './kelas.entity';
import { Pembayaran } from './pembayaran.entity';

export type Bulan = 3 | 6 | 12;

@Entity()
export class Cicilan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  harga: number[];

  @Column({ type: 'enum', enum: [3, 6, 12] })
  bulan: Bulan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.cicilan, { onDelete: 'CASCADE' })
  kelas: Kelas;

  @OneToOne(() => Pembayaran, (pembayaran) => pembayaran.cicilan, {
    onDelete: 'CASCADE',
  })
  pembayaran: Pembayaran;
}
