import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateKelassDto {
    @IsString()
    nama_kelas: string

      @IsInt()
      kategoriId: number;
      
      @IsInt()
      harga: number;

      @IsString()
      informasi_kelas: string;

      @IsBoolean()
      @IsOptional()
      launch: boolean

      @IsString()
      teknologi: string;

      @IsString()
      target_pembelajaran: string;

    @IsString()
    gambar: string

    @IsString()
    deskripsi: string
}
