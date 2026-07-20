import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePertanyaanKelaDto {
  @IsArray()
  @IsNotEmpty()
  questions: string[];

  @IsArray()
  @IsNotEmpty()
  answer: string[];

  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
