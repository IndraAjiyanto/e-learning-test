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

  @Column()
  pertanyaan: string;

  @Column()
  jawaban: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Translation, (translation) => translation.pertanyaan_kelas)
  translation: Translation;

  @ManyToOne(() => Kelas, (kelas) => kelas.pertanyaan_kelas, {
    onDelete: 'CASCADE',
  })
  kelas: Kelas;
}
