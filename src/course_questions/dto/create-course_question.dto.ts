import { IsArray, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateCourseQuestionDto {
  @IsArray()
  @IsNotEmpty()
  questions: string[];

  @IsArray()
  @IsNotEmpty()
  answer: string[];

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
