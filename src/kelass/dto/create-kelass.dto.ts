import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
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

  @IsString()
  lokasi: string;

  @IsInt()
  jenis_kelasId: number;

  @IsInt()
  mentoringId: number;

  @IsInt()
  bulanId: number;

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

  @IsString()
  deskripsi: string;

  @IsArray()
  @IsOptional()
  kriteria: string[];
}
