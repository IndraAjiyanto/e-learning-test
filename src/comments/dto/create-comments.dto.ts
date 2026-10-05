import { IsInt, IsString, IsUUID } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateCommentsDto {
  @IsString()
  comment: string;

  @IsUUID()
  answerTaskId: string;

  @IsString()
  process: ProcessStatus;
}
