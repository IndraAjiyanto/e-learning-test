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
export class BenefitKelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb',{nullable: true})
  benefit: string[];

  @Column('jsonb',{nullable: true})
  isi: string[];

  @Column()
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.benefit_kelas, {
    onDelete: 'CASCADE',
  })
  kelas: Kelas;
}
