import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreatePortfolioDto {
  @IsArray()
  gambar: string[];

  @IsString()
  judul: string;

  @IsString()
  deskripsi: string;

  @IsString()
  link: string;

  @IsArray()
  teknologi: string[];

  @IsNumber()
  userId: number;

  @IsNumber()
  kelasId: number;
}
