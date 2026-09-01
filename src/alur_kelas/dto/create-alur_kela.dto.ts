import { IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateAlurKelaDto {
  @IsInt()
  @IsOptional()
  alur_ke?: number;

  @IsArray()
  judul: string[];

  @IsArray()
  isi: string[];

  @IsInt()
  kelasId: string;
}
