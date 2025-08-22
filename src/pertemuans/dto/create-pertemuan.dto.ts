import { IsString, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreatePertemuanDto {
  @IsString()
  topik: string;

  @IsInt()
  pertemuan_ke: number;

  @IsDateString()
  tanggal: Date;

  @IsString()
  waktu_awal: string;

  @IsString()
  waktu_akhir: string;

  @IsInt()
  kelasId: number;
}
