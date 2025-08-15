import { IsString } from "class-validator";

export class CreateKelassDto {
    @IsString()
    nama_kelas: string

    @IsString()
    gambar: string

    @IsString()
    deskripsi: string
}
