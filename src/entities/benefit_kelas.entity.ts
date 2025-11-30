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
import { Kelas } from './kelas.entity';

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
