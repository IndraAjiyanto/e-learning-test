import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateKelassDto {
    @IsString()
    nama_kelas: string

      @IsInt()
      kategoriId: number;
      
      @IsInt()
      harga: number;

      @IsBoolean()
      @IsOptional()
      launch: boolean

          @IsString()
          teknologi: string[]
      
          @IsArray()
          materi: string[];

      @IsArray()
      target_pembelajaran: string[];

    @IsString()
    gambar: string

    @IsString()
    deskripsi: string
}
