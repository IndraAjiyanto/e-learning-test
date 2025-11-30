import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';

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
