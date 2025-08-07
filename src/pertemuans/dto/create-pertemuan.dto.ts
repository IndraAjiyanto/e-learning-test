import { IsString, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreatePertemuanDto {
  @IsString()
  topik: string;

  @IsInt()
  pertemuan_ke: number;

  @IsDateString()
  tanggal: Date;

  @IsInt()
  kelasId: number;
}
