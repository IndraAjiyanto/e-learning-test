import { IsString, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreatePertemuanDto {
  @IsString()
  topik: string;

  @IsDateString()
  tanggal: Date;

  @IsInt()
  kelasId: number;
}
