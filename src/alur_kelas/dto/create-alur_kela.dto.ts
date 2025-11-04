import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAlurKelaDto {
  @IsInt()
  @IsOptional()
  alur_ke?: number;

  @IsString()
  judul: string;

  @IsString()
  isi: string;

  @IsInt()
  kelasId: number;
}
