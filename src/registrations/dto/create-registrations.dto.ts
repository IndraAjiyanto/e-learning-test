import { IsBooleanString, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateRegistrationsDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['approved', 'process', 'rejected'])
  @IsOptional()
  process: ProcessStatus;

  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

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
