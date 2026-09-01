import {
  IsArray,
  IsNotEmpty,
  IsUUID,
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

  @IsUUID()
  @IsNotEmpty()
  kategori_blog: string;

  @IsUUID()
  @IsNotEmpty()
  topic: string;
}
