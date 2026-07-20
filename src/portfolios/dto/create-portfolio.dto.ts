import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
  content_html: string;

  @IsArray()
  teknologi: string[];

  @IsNumber()
  userId: number;

  @IsNumber()
  courseId: number;
}
