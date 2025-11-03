import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';

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
}
