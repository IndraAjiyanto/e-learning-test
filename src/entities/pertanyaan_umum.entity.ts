import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kategori } from './kategori.entity';

@Entity()
export class PertanyaanUmum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pertanyaan: string;

  @Column()
  jawaban: string;

  @ManyToOne(() => Kategori, (kategori) => kategori.pertanyaan_umum, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  kategori?: Kategori;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
