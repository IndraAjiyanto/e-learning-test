import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kategori } from './kategori.entity';
import { Kelas } from './kelas.entity';
import { Translation } from './translation.entity';

@Entity()
export class PertanyaanKelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb',{nullable: true})
  pertanyaan: string[];

  @Column('jsonb',{nullable: true})
  jawaban: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.pertanyaan_kelas, {
    onDelete: 'CASCADE',
  })
  kelas: Kelas;
}
