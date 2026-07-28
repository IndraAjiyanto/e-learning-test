import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMentorDto {
  @IsString()
  name: string;

  @IsArray()
  position: string[];

  @IsString()
  profile: string;

  @IsArray()
  technology: string[];

  @IsString()
  linkedin: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  technologyId: number[];

  @IsArray()
  description: string[];

  @IsInt()
  courseId: number;
}
