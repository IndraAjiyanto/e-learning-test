import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { JenisKelas } from './jenis_kelas.entity';
import { PertanyaanUmum } from './pertanyaan_umum.entity';
import { BenefitCategory } from './benefit_category.entity';
import { FlowCategory } from './flow_category.entity';
import { Superiority } from './superiority.entity';
import { Translation } from './translation.entity';

export type Type = 'Special Program' | 'Program';

@Entity()
export class Kategori {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama_kategori: string;

  @Column({ nullable: true })
  text: string;

  @Column()
  icon: string;

  @Column()
  deskripsi: string;

  @Column({ nullable: true })
  contact: number;

  @Column({ nullable: true })
  for: string;

  @Column({ nullable: true, type: 'jsonb' })
  info: string[];

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
  kelas: Kelas[];

  @OneToMany(
    () => PertanyaanUmum,
    (pertanyaan_umum) => pertanyaan_umum.kategori,
  )
  pertanyaan_umum: PertanyaanUmum[];

  @OneToMany(
    () => BenefitCategory,
    (benefit_category) => benefit_category.kategori,
  )
  benefit_category: BenefitCategory[];

  @OneToMany(() => FlowCategory, (flow_category) => flow_category.kategori)
  flow_category: FlowCategory[];

    @OneToMany(() => Superiority, (superiority) => superiority.kategori)
    superiority: Superiority[];

  @ManyToMany(() => JenisKelas, (jenisKelas) => jenisKelas.kategoris)
  @JoinTable()
  jenis_kelas: JenisKelas[];

  @OneToOne(() => Translation, (translation) => translation.kategori)
  translation: Translation;
}
