import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTentangDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  gambar: string;
}
