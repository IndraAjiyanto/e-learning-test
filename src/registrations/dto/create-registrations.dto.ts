import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsBooleanString,
} from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateRegistrationsDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['approved', 'process', 'rejected'])
  @IsOptional()
  process: ProcessStatus;

  @IsInt()
  userId: number;

  @IsInt()
  courseId: number;

  @IsString()
  user_fullname: string;

  @IsString()
  user_email: string;

  @IsString()
  user_no: string;

  @IsString()
  current_status: string;

  @IsBooleanString()
  attend_program: boolean;

  @IsString()
  referal_source: string;
}
