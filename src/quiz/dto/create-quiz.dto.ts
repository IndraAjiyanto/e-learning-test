import { IsInt, IsString, IsUUID } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  quizName: string;

  @IsInt()
  minScore: number;

  @IsUUID()
  weeksId: string;

  @IsInt()
  duration: number;
}
