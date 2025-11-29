import { IsArray, IsString } from 'class-validator';

export class CreateJenisKelaDto {
  @IsArray()
  nama_jenis_kelas: string[];

  @IsString()
  icon: string;

  @IsArray()
  deskripsi: string[];
}
