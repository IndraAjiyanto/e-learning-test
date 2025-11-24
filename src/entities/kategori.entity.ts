import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { PertanyaanUmum } from './pertanyaan_umum.entity';

export type Type = 'Special Program' | 'Program';

@Entity()
export class Kategori {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama_kategori: string;

  @Column({nullable: true})
  nama_kategori_uniq: string

  @Column()
  icon: string;

  @Column()
  deskripsi: string;

  @Column({ type: 'enum', enum: ['Special Program', 'Program'], nullable: true })
  type: Type;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Kelas, (kelas) => kelas.kategori)
  kelas: Kelas[];

  @OneToMany(() => PertanyaanUmum, (pertanyaan_umum) => pertanyaan_umum.kategori)
  pertanyaan_umum: PertanyaanUmum[];
}
