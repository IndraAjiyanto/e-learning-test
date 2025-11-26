import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateKategorisDto {
  @IsString()
  nama_kategori: string;

  @IsString()
  icon: string;

  @IsString()
  deskripsi: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsNumber()
  contact?: number;

  @IsOptional()
  @IsString()
  for?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  jenis_kelas?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  info?: string[];

  @IsEnum(['Special Program', 'Program'])
  type: 'Special Program' | 'Program';
}
