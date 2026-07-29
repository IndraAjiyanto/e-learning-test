import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
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
}
