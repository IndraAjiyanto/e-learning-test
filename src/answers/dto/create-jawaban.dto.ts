import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class CreateJawabanDto {
  @IsString()
  answer: string;

  @IsBoolean()
  is_correct: boolean;

  @IsUUID()
  questionsId: string;
}
