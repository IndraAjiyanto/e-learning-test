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
import { Translation } from './translation.entity';

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

  @OneToOne(() => Translation, (translation) => translation.pertanyaan_umum)
  translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
