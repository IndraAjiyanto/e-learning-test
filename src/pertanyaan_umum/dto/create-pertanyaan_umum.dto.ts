import { IsString } from "class-validator";

export class CreatePertanyaanUmumDto {
    @IsString()
    pertanyaan: string

    @IsString()
    jawaban: string
}
