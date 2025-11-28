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
  judul_jp: string;

  @IsNotEmpty()
  @IsString()
  text_id: string;

  @IsNotEmpty()
  @IsString()
  text_en: string;

  @IsNotEmpty()
  @IsString()
  text_jp: string;

  @IsOptional()
  @IsString()
  gambar: string;
}
