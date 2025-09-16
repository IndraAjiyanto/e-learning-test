import { IsInt, IsString } from "class-validator";

export class CreateQuizDto {
    @IsString()
    nama_quiz: string;

    @IsInt()
    mingguId: number;
}
