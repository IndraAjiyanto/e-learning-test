import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { JenisKelas } from './jenis_kelas.entity';
import { PertanyaanUmum } from './pertanyaan_umum.entity';
import { BenefitCategory } from './benefit_category.entity';
import { FlowCategory } from './flow_category.entity';
import { Superiority } from './superiority.entity';
import { Exclude } from 'class-transformer';

export type Type = 'Special Program' | 'Program';

@Entity()
export class Kategori {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nama_kategori: string;

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  icon: string;

  @Column('jsonb', { nullable: true })
  deskripsi: string[];

  @Column({ nullable: true })
  contact: string;

  @Column('jsonb', { nullable: true })
  for: string[];

  @Column({ nullable: true, type: 'jsonb' })
  info_id: string[];

  @Column({ nullable: true, type: 'jsonb' })
  info_en: string[];

  @Column({ nullable: true, type: 'jsonb' })
  info_ja: string[];

  @Column({
    type: 'enum',
    enum: ['Special Program', 'Program'],
    nullable: true,
  })
  type: Type;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Kelas, (kelas) => kelas.kategori)
  @Exclude()
  kelas: Kelas[];

  @OneToMany(
    () => PertanyaanUmum,
    (pertanyaan_umum) => pertanyaan_umum.kategori,
  )
  @Exclude()
  pertanyaan_umum: PertanyaanUmum[];

  @OneToMany(
    () => BenefitCategory,
    (benefit_category) => benefit_category.kategori,
  )
  @Exclude()
  benefit_category: BenefitCategory[];

  @OneToMany(() => FlowCategory, (flow_category) => flow_category.kategori)
  @Exclude()
  flow_category: FlowCategory[];

  @OneToMany(() => Superiority, (superiority) => superiority.kategori)
  @Exclude()
  superiority: Superiority[];

  @ManyToMany(() => JenisKelas, (jenisKelas) => jenisKelas.kategoris)
  @JoinTable()
  @Exclude()
  jenis_kelas: JenisKelas[];
}
