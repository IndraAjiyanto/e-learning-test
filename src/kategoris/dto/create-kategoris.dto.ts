import { IsString, IsOptional, IsEnum } from 'class-validator';

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

  @IsEnum(['Special Program', 'Program'])
  type: 'Special Program' | 'Program';
}
