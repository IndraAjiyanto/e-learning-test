import { IsArray, IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateCourseFlowDto {
  @IsInt()
  @IsOptional()
  sequence?: number;

  @IsArray()
  title: string[];

  @IsArray()
  content: string[];

  @IsUUID()
  courseId: string;
}
