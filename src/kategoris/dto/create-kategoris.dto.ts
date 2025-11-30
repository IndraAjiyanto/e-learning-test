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
  @IsNumber()
  contact?: number;

  @IsOptional()
  @IsArray()
  for?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  jenis_kelas?: number[];

  @IsOptional()
  @IsArray()
  info?: string[];

  @IsEnum(['Special Program', 'Program'])
  type: 'Special Program' | 'Program';
}
