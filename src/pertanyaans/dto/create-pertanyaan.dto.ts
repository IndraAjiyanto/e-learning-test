import { IsArray, IsInt, IsNumber, IsString } from "class-validator";

export class CreatePertanyaanDto {
    @IsString()
    pertanyaan_soal: string

    @IsInt()
    pertemuanId: number

  @IsArray()
  @IsString({ each: true })
  pilihan: string[];

    @IsNumber()
  jawaban: number;
}
