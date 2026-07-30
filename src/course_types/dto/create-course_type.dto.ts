import { IsArray, IsString } from 'class-validator';

export class CreateCourseTypeDto {
  @IsString()
  nameClassesType: string;

  @IsString()
  icon: string;

  @IsArray()
  description: string[];
}
