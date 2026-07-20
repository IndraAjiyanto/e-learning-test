import { IsInt, IsString } from 'class-validator';

export class CreateLogbookMentorDto {
  @IsString()
  activity: string;

  @IsString()
  activity_detail: string;

  @IsString()
  documentation: string;

  @IsString()
  obstacle: string;

  @IsInt()
  userId: number;

  @IsInt()
  sessionId: number;
}
