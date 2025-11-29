import { IsString } from 'class-validator';
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
export class AlurKelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alur_ke: number;

  @Column('jsonb', { nullable: true  })
  judul: string[];

  @Column('jsonb', { nullable: true  })
  isi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.alur_kelas, { onDelete: 'CASCADE' })
  kelas: Kelas;
}
