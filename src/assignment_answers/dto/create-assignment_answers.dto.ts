import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateAssignmentAnswersDto {
  @IsString()
  file: string;

  @IsString()
  @IsOptional()
  comment: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  taskId: string;

  @IsEnum(['approved', 'process', 'rejected'])
  process: ProcessStatus;
}
