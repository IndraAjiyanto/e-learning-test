import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateCourseBenefitDto {
  @IsArray()
  benefit: string[];

  @IsString()
  icon: string;

  @IsArray()
  description: string[];

  @IsInt()
  courseId: number;
}
