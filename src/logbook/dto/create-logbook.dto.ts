import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, isString, IsString } from 'class-validator';
import { Proses } from 'src/entities/logbook.entity';

export class CreateLogbookDto {
  @IsString()
  kegiatan: string;

  @IsString()
  rincian_kegiatan: string;

  @IsOptional()
  @IsString()
  dokumentasi?: string | null;

  @IsString()
  dokumentasi_lain: string;

  @IsString()
  kendala: string;
  
@IsOptional() // Tambahkan opsional untuk update
  @Type(() => Number) // <--- 2. Tambahkan ini agar string "1" jadi angka 1
  @IsInt()
  userId: number;

  @IsOptional() // Tambahkan opsional untuk update
  @IsEnum(['acc', 'proces', 'rejected'])
  proses: Proses;

 @IsOptional() // Tambahkan opsional untuk update
  @Type(() => Number) // <--- 3. Tambahkan ini juga
  @IsInt()
  pertemuanId: number;
}
