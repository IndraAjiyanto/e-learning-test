import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAlurKelaDto {
  @IsInt()
  @IsOptional()
  alur_ke?: number;

  @IsArray()
  judul: string[];

  @IsArray()
  isi: string[];

  @IsInt()
  kelasId: number;
}
