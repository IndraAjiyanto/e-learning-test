import { IsArray, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateCourseBenefitDto {
  @IsArray()
  benefit: string[];

  @IsString()
  icon: string;

  @IsArray()
  description: string[];

  @IsUUID()
  courseId: string;
}
