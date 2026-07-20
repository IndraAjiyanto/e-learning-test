import { IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateAlurKelaDto {
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
