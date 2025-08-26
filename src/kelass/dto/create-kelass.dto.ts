import { IsInt, IsString } from "class-validator";

export class CreateKelassDto {
    @IsString()
    nama_kelas: string

      @IsInt()
      kategoriId: number;

    @IsString()
    gambar: string

    @IsString()
    deskripsi: string
}
