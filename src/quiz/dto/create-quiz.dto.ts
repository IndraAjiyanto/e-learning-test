import { IsInt, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  quizName: string;

  @IsInt()
  minScore: number;

  @IsInt()
  weeksId: number;

  @IsInt()
  duration: number;
}
