import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  answer: string;

  @IsBoolean()
  is_correct: boolean;

  @IsInt()
  questionsId: number;
}
