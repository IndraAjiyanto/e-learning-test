import { IsInt, IsString } from "class-validator";

export class CreateAlumnusDto {
    @IsString()
    profile: string

    @IsString()
    nama: string

    @IsString()
    pesan: string

    @IsString()
    alumni: string

    @IsString()
    posisi_sekarang: string

    @IsInt()
    kelas: string
}
