import { IsBoolean, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  answer: string;

  @IsBoolean()
  is_correct: boolean;

  @IsUUID()
  questionsId: string;
}
