import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateAlumnusDto {
  @IsString()
  profile: string;

  @IsArray()
  nama: string[];

  @IsArray()
  pesan: string[];

  @IsArray()
  alumni: string[];

  @IsArray()
  posisi_sekarang: string[];

  @IsInt()
  kelasId: string;
}
