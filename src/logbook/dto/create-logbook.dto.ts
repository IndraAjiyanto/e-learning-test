import { IsInt, IsString } from "class-validator";

export class CreateLogbookDto {
    @IsString()
    kegiatan: string;

    @IsString()
    rincian_kegiatan: string;

    @IsString()
    dokumentasi: string;

    @IsString()
    kendala: string;

    @IsInt()
    userId: number;

    @IsInt()
    kelasId: number;
}
