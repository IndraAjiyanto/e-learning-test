import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePortfolioDto {
  @IsArray()
  image: string[];

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  link: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  contentHtml: string;

  @IsArray()
  @IsOptional()
  technologies: string[];

  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;
}
