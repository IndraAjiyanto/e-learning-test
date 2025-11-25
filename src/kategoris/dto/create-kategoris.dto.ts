import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateKategorisDto {
  @IsString()
  nama_kategori: string;

  @IsOptional()
  @IsString()
  nama_kategori_uniq?: string;

  @IsString()
  icon: string;

  @IsString()
  deskripsi: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  info?: string[];

  @IsEnum(['Special Program', 'Program'])
  type: 'Special Program' | 'Program';
}
