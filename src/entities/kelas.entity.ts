import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Kategori } from './kategori.entity';
import { Pembayaran } from './pembayaran.entity';
import { Minggu } from './minggu.entity';
import { Sertifikat } from './sertifikat.entity';
import { JenisKelas } from './jenis_kelas.entity';
import { UserKelas } from './user_kelas.entity';
import { PertanyaanKelas } from './pertanyaan_kelas.entity';
import { Mentor } from './mentor.entity';
import { Alumni } from './alumni.entity';
import { Cicilan } from './cicilan.entity';
import { Teknologi } from './teknologi.entity';
import { AlurKelas } from './alur_kelas.entity';
import { BenefitKelas } from './benefit_kelas.entity';
import { Mentoring } from './mentoring.entity';
import { Pendaftaran } from './pendaftaran.entity';
import { Exclude } from 'class-transformer';

export type Metode = 'online' | 'offline';
export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama_kelas: string;

  @Column('jsonb',{nullable: true})
  deskripsi: string[];

  @Column()
  grup: string;

  @Column()
  gambar: string;

  @Column({ nullable: true })
  harga: number;

  @Column({ nullable: true })
  promo: number;

  @Column({ nullable: true })
  link_lokasi: string;

  @Column('jsonb',{nullable: true})
  lokasi: string[];

  @Column({ type: 'enum', enum: ['online', 'offline'] })
  metode: Metode;

  @Column('jsonb',{nullable: true})
  kriteria_id: string[];

  @Column('jsonb',{nullable: true})
  kriteria_en: string[];

  @Column('jsonb',{nullable: true})
  kriteria_ja: string[];

  @Column({ default: false })
  launch: boolean;

  @ManyToMany(() => Teknologi, (teknologi) => teknologi.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'kelas_teknologi',
    joinColumn: { name: 'kelasId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'teknologiId', referencedColumnName: 'id' },
  })
  @Exclude()
  teknologi: Teknologi[];

  @Column({
    type: 'enum',
    enum: ['acc', 'proces', 'rejected'],
    default: 'rejected',
  })
  proses: Proses;

  @Column('jsonb', {nullable: true})
  materi_id: string[];

  @Column('jsonb', {nullable: true})
  materi_en: string[];

  @Column('jsonb', {nullable: true})
  materi_ja: string[];

  @Column('jsonb', {nullable: true})
  target_pembelajaran_id: string[];

  @Column('jsonb', {nullable: true})
  target_pembelajaran_en: string[];
  
  @Column('jsonb', {nullable: true})
  target_pembelajaran_ja: string[];

  @Column({ nullable: true })
  kuota: number;

  @Column({ nullable: true })
  form: string;

  @Column({ default: false })
  check_paid: boolean;

  @Column({ nullable: true })
  bulan: number;

  @Column({ nullable: true })
  hari: number;

  @Column()
  tanggal_mulai: Date;

  @Column()
  tanggal_selesai: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserKelas, (user_kelas) => user_kelas.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  user_kelas: UserKelas[];

  @OneToMany(() => Mentoring, (mentoring) => mentoring.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  mentoring: Mentoring[];

  @OneToMany(() => Minggu, (minggu) => minggu.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  minggu: Minggu[];

  @OneToMany(() => Alumni, (alumni) => alumni.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  alumni: Alumni[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  portfolio: Portfolio[];

  @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  pembayaran: Pembayaran[];

  @ManyToOne(() => Kategori, (kategori) => kategori.kelas, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  kategori: Kategori;

  @ManyToOne(() => JenisKelas, (jenis_kelas) => jenis_kelas.kelas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'jenis_kelasId' })
  @Exclude()
  jenis_kelas: JenisKelas;

  @OneToMany(() => Sertifikat, (sertifikat) => sertifikat.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  sertifikat: Sertifikat[];

  @OneToMany(
    () => PertanyaanKelas,
    (pertanyaan_kelas) => pertanyaan_kelas.kelas,
  )
  @Exclude()
  pertanyaan_kelas: PertanyaanKelas[];

  @OneToMany(() => Mentor, (mentor) => mentor.kelas)
  @Exclude()
  mentor: Mentor[];

  @OneToMany(() => Cicilan, (cicilan) => cicilan.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  cicilan: Cicilan[];

  @OneToMany(() => AlurKelas, (alur_kelas) => alur_kelas.kelas)
  @Exclude()
  alur_kelas: AlurKelas[];

  @OneToMany(() => BenefitKelas, (benefit_kelas) => benefit_kelas.kelas)
  @Exclude()
  benefit_kelas: BenefitKelas[];

  @OneToMany(() => Pendaftaran, (pendaftaran) => pendaftaran.kelas, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  pendaftaran: Pendaftaran[];
}
