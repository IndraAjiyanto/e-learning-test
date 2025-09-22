import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Metode } from "src/entities/kelas.entity";

export class CreateKelassDto {
    @IsString()
    nama_kelas: string

          @IsEnum(['online' , 'offline'])
      metode: Metode;

      @IsInt()
      kategoriId: number;
      
      @IsString()
      lokasi: string

      @IsInt()
      jenis_kelasId: number;
      
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
