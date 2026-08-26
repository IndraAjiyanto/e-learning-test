import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateAlumnusDto {
  @IsString()
  profile: string;

  @IsArray()
  name: string[];

  @IsArray()
  message: string[];

  @IsArray()
  currentPosition: string[];

  @IsInt()
  courseId: number;
}
