import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JawabanTugas } from './jawaban_tugas.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Komentar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  komentar: string;

  @ManyToOne(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.komentar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'jawaban_tugasId' })
  @Exclude()
  jawaban_tugas: JawabanTugas;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
