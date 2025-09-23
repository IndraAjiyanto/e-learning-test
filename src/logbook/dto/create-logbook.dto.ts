import { IsEnum, IsInt, IsString } from "class-validator";
import { Proses } from "src/entities/logbook.entity";

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

        @IsEnum(['acc' , 'proces' , 'rejected'])
        proses: Proses;

    @IsInt()
    pertemuanId: number;
}
