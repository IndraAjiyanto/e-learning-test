import { IsInt, IsString } from "class-validator";

export class CreateQuizDto {
    @IsString()
    nama_quiz: string;

    @IsInt()
    nilai_minimal: number;

    @IsInt()
    mingguId: number;
}
