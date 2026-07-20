import { IsArray, IsInt, IsNumber, IsString } from 'class-validator';

export class CreatePertanyaanDto {
  @IsString()
  questionText: string;

  @IsInt()
  quizId: number;

  @IsArray()
  @IsString({ each: true })
  pilihan: string[];

  @IsString()
  image?: string;

  @IsNumber()
  answers: number;
}
