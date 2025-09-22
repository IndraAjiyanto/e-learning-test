import { Transform } from 'class-transformer';
import { IsString, IsDateString, IsInt, IsBooleanString, IsOptional, IsEnum } from 'class-validator';

export class CreatePertemuanDto {
  @IsString()
  topik: string;

  @IsString()
  lokasi: string;



  @IsInt()
  pertemuan_ke: number;

  @IsDateString()
  tanggal: Date;

  @IsString()
  waktu_awal: string;

  @IsString()
  waktu_akhir: string;

  @IsBooleanString()
  akhir: boolean

  @IsString()
  akhir_check: string

  @IsInt()
  mingguId: number;
}
