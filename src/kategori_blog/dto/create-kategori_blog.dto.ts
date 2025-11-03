import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKategoriBlogDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  deskripsi: string;
}
