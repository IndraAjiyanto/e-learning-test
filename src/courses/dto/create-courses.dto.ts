import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Method, ProcessState } from 'src/entities/course.entity';

export class CreateCoursesDto {
  @IsString()
  courseName: string;

  @IsString()
  group: string;

  @IsEnum(['online', 'offline'])
  method: Method;

  @IsInt()
  categoryId: number;

  @IsArray()
  location: string[];

  @IsInt()
  courseTypeId: number;

  @IsInt()
  mentoringsId: number;

  @IsInt()
  @IsOptional()
  month: number;

  @IsInt()
  @IsOptional()
  day: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsInt()
  @IsOptional()
  price: number;

  @IsInt()
  @IsOptional()
  promo: number;

  @IsInt()
  @IsOptional()
  quota: number;

  @IsString()
  @IsOptional()
  form: string;

  @IsBoolean()
  @IsOptional()
  launch: boolean;

  @IsBoolean()
  @IsOptional()
  check_paid: boolean;

  @IsString()
  paid_check: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  technologiesIds?: number[];

  @IsArray()
  materials: string[];

  @IsArray()
  learningTarget: string[];

  @IsString()
  @IsOptional()
  image: string;

  @IsEnum(['acc', 'proces', 'rejected'])
  @IsOptional()
  process: ProcessState;

  @IsArray()
  description: string[];

  @IsArray()
  @IsOptional()
  criteria: string[];
}
