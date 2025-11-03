import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTentangDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  gambar: string;
}
