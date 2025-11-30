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

@Entity()
export class PertanyaanUmum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  pertanyaan: string[];

  @Column('jsonb', { nullable: true })
  jawaban: string[];

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
