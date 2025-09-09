import { Transform } from 'class-transformer';
import { IsString, IsDateString, IsInt, IsBooleanString, IsOptional, IsEnum } from 'class-validator';
import { Metode } from 'src/entities/pertemuan.entity';

export class CreatePertemuanDto {
  @IsString()
  topik: string;

  @IsString()
  lokasi: string;

      @IsEnum(['online' , 'offline'])
      metode: Metode;

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
  kelasId: number;
}
