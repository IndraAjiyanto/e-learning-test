import {
  IsArray,
  IsBoolean,
  isDateString,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Method } from 'src/entities/course.entity';
import { ProcessStatus } from 'src/entities/types/process-status';

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
  locations: string[];

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
  checkPaid: boolean;

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

  @IsEnum(['approved', 'process', 'rejected'])
  @IsOptional()
  process: ProcessStatus;

  @IsArray()
  description: string[];

  @IsArray()
  @IsOptional()
  criteria: string[];

  @IsOptional()
  date_registration: Date;

  @IsOptional()
  time_start?: string;

  @IsOptional()
  time_end?: string;
}
