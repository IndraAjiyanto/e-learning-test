import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTentangDto {
  @IsNotEmpty()
  @IsString()
  judul_id: string;

  @IsNotEmpty()
  @IsString()
  judul_en: string;

  @IsNotEmpty()
  @IsString()
  judul_ja: string;

  @IsNotEmpty()
  @IsString()
  text_id: string;

  @IsNotEmpty()
  @IsString()
  text_en: string;

  @IsNotEmpty()
  @IsString()
  text_ja: string;

  @IsOptional()
  @IsString()
  gambar: string;
}
