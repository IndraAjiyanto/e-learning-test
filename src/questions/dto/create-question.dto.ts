import { IsArray, IsInt, IsNumber, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  questionText: string;

  @IsInt()
  quizId: number;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  image?: string;

  @IsNumber()
  answers: number;
}
