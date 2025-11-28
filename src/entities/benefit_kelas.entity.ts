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

  @Column()
  benefit: string;

  @Column()
  isi: string;

  @Column()
  icon: string;

    @OneToOne(() => Translation, (translation) => translation.benefit_kelas)
    translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.benefit_kelas, {
    onDelete: 'CASCADE',
  })
  kelas: Kelas;
}
