import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ProcessType } from 'src/entities/answer_task.entity';

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

  @IsEnum(['acc', 'proces', 'rejected'])
  process: ProcessType;
}
