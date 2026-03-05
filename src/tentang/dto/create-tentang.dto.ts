import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTentangDto {
  @IsNotEmpty()
  @IsArray()
  judul: string[];

  @IsNotEmpty()
  @IsArray()
  text: string[];

  @IsOptional()
  @IsString()
  gambar: string;
}
