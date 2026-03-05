import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class AlurKelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alur_ke: number;

  @Column('jsonb', { nullable: true })
  judul: string[];

  @Column('jsonb', { nullable: true })
  isi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.alur_kelas, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;
}
