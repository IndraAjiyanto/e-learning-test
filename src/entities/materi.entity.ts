import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Pertemuan } from './pertemuan.entity';
import { Exclude } from 'class-transformer';

export type JenisFile = 'video' | 'pdf' | 'ppt';

@Entity()
export class Materi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column()
  file: string;

  @Column('jsonb', { nullable: true })
  slides: string[];

  @Column({ type: 'enum', enum: ['video', 'pdf', 'ppt'] })
  jenis_file: JenisFile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.materi, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertemuan: Pertemuan;
}
