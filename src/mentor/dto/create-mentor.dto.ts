import { IsArray, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

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
  @IsUUID('all', { each: true })
  @IsOptional()
  technologyId: string[];

  @IsArray()
  description: string[];

  @IsUUID()
  courseId: string;
}
