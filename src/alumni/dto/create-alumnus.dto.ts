import { IsArray, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateAlumnusDto {
  @IsString()
  profile: string;

  @IsArray()
  name: string[];

  @IsArray()
  message: string[];

  @IsArray()
  currentPosition: string[];

  @IsUUID()
  courseId: string;
}
