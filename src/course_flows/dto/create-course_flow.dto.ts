import { IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateCourseFlowDto {
  @IsInt()
  @IsOptional()
  sequence?: number;

  @IsArray()
  title: string[];

  @IsArray()
  content: string[];

  @IsInt()
  courseId: number;
}
