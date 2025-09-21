import { IsString } from "class-validator";

export class CreateJenisKelaDto {
    @IsString()
    nama_jenis_kelas: string
}
