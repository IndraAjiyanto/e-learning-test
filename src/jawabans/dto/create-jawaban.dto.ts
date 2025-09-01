import { IsBoolean, IsInt, IsString } from "class-validator";

export class CreateJawabanDto {
    @IsString()
    jawaban: string

    @IsBoolean()
    jawaban_benar: boolean

    @IsInt()
    pertanyaanId: number

}
