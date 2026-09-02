import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePortfolioDto {
  @IsArray()
  gambar: string[];

  @IsString()
  judul: string;

  @IsString()
  deskripsi: string;

  @IsString()
  link: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  content_html: string;

  @IsArray()
  teknologi: string[];

  @IsNumber()
  userId: number;

  @IsNumber()
  kelasId: number;
}
