import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateAssignmentAnswersDto {
  @IsString()
  file: string;

  @IsString()
  @IsOptional()
  comment: string;

  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;

  @IsEnum(['approved', 'process', 'rejected'])
  process: ProcessStatus;
}
