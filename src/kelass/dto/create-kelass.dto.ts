import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Metode, Proses } from 'src/entities/kelas.entity';

export class CreateKelassDto {
  @IsString()
  nama_kelas: string;

  @IsString()
  grup: string;

  @IsEnum(['online', 'offline'])
  metode: Metode;

  @IsInt()
  kategoriId: number;

  @IsArray()
  lokasi: string[];

  @IsInt()
  jenis_kelasId: number;

  @IsInt()
  mentoringId: number;

  @IsInt()
  @IsOptional()
  bulan: number;

  @IsInt()
  @IsOptional()
  hari: number;

  @IsDateString()
  tanggal_mulai: Date;

  @IsDateString()
  tanggal_selesai: Date;

  @IsInt()
  @IsOptional()
  harga: number;

  @IsInt()
  @IsOptional()
  promo: number;

  @IsInt()
  @IsOptional()
  kuota: number;

  @IsString()
  @IsOptional()
  form: string;

  @IsBoolean()
  @IsOptional()
  launch: boolean;

  @IsBoolean()
  @IsOptional()
  check_paid: boolean;

  @IsString()
  paid_check: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  teknologiIds: number[];

  @IsArray()
  materi: string[];

  @IsArray()
  target_pembelajaran: string[];

  @IsString()
  @IsOptional()
  gambar: string;

  @IsEnum(['acc', 'proces', 'rejected'])
  @IsOptional()
  proses: Proses;

  @IsArray()
  deskripsi: string[];

  @IsArray()
  @IsOptional()
  kriteria: string[];
}
