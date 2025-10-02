import { IsInt, IsString } from "class-validator";

export class CreateAlurKelaDto {
    @IsInt()
    alur_ke: number

    @IsString()
    judul: string

    @IsString()
    isi: string

    @IsInt()
    kategoriId: number
}
