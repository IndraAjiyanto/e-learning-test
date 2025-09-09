import { IsInt, IsString } from "class-validator";
import { Proses } from "src/entities/jawaban_tugas.entity";

export class CreateKomentarDto {
    @IsString()
    komentar: string;

    @IsInt()
    jawaban_tugasId: number;

    @IsString()
    proses: Proses
}
