import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kategori } from './kategori.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class PertanyaanUmum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { nullable: true })
  pertanyaan: string[];

  @Column('jsonb', { nullable: true })
  jawaban: string[];

  @ManyToOne(() => Kategori, (kategori) => kategori.pertanyaan_umum, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Exclude()
  kategori?: Kategori;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
