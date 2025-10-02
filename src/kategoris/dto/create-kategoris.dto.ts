import { IsString } from "class-validator"

export class CreateKategorisDto {
    @IsString()
    nama_kategori: string

        @IsString()
        icon: string
    
        @IsString()
        deskripsi: string
}
