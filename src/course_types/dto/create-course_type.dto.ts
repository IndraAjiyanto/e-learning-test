import { IsArray, IsString } from 'class-validator';

export class CreateCourseTypeDto {
  @IsString()
  name_clasess_type: string;

  @IsString()
  icon: string;

  @IsArray()
  description: string[];
}
