import { IsArray, IsInt, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  questionText: string;

  @IsUUID()
  quizId: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  image?: string;

  @IsNumber()
  answers: number;
}
