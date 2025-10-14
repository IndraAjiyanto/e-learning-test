import { IsArray, IsInt, IsNumber, IsString } from "class-validator";

export class CreatePertanyaanDto {
    @IsString()
    pertanyaan_soal: string

    @IsInt()
    quizId: number

  @IsArray()
  @IsString({ each: true })
  pilihan: string[];

  @IsString()
  gambar?: string;

    @IsNumber()
  jawaban: number;
}
