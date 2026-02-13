import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsString()
  @IsNotEmpty()
  isi: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsArray()
  gambar: string[];

  @IsNumber()
  @IsNotEmpty()
  kategori_blog: number;

  @IsNumber()
  @IsNotEmpty()
  topic: number;
}
