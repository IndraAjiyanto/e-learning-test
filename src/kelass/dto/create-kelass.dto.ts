import { IsString } from "class-validator";

export class CreateKelassDto {
    @IsString()
    nama_kelas: string

    @IsString()
    deskripsi: string
}
