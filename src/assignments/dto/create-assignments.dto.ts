import { IsNumber, IsString } from 'class-validator';

export class CreateAssignmentsDto {
  @IsString()
  file: string;

  @IsString()
  title: string;

  @IsNumber()
  sessionId: number;
}
