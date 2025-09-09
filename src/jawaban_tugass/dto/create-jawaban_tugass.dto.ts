import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Proses } from "src/entities/jawaban_tugas.entity";

export class CreateJawabanTugassDto {
    @IsString()
    file: string

    @IsInt()
    nilai: number

    @IsInt()
    userId: number

    @IsInt()
    tugasId: number

    @IsEnum(['acc' , 'proces' , 'rejected'])
    proses: Proses;
}
