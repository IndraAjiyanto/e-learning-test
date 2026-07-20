import { IsInt, IsString } from 'class-validator';
import { ProcessType } from 'src/entities/answer_task.entity';

export class CreateCommentsDto {
  @IsString()
  comment: string;

  @IsInt()
  answerTaskId: number;

  @IsString()
  process: ProcessType;
}
