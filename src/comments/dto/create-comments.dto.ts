import { IsInt, IsString } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateCommentsDto {
  @IsString()
  comment: string;

  @IsInt()
  answerTaskId: number;

  @IsString()
  process: ProcessStatus;
}
