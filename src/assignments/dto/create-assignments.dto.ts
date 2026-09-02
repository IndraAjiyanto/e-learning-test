import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentsDto {
  @IsString()
  file: string;

  @IsString()
  title: string;

  @IsUUID()
  sessionId: string;
}
