import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { Kategori } from './kategori.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class JenisKelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nama_jenis_kelas: string;

  @Column()
  icon: string;

  @Column('jsonb', { nullable: true })
  deskripsi: string[];

  @OneToMany(() => Kelas, (kelas) => kelas.jenis_kelas)
  @Exclude()
  kelas: Kelas[];

  @ManyToMany(() => Kategori, (kategori) => kategori.jenis_kelas)
  @Exclude()
  kategoris: Kategori[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
