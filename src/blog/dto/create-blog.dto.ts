import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsArray()
  @IsNotEmpty()
  isi: string[];

  @IsArray()
  isi_editorjs: string[];

  @IsArray()
  tags: string[];

  @IsString()
  keyword: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
