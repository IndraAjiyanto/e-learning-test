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

  @IsArray()
  deskripsi: string[];

  @IsOptional()
  @IsArray()
  text?: string[];

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsArray()
  for?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  jenis_kelas?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  info_id?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  info_en?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  info_ja?: string[];

  @IsEnum(['Special Program', 'Paid Program', 'Free Program'])
  type: 'Special Program' | 'Paid Program' | 'Free Program';
}
