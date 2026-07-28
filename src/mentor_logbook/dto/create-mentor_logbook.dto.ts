import { IsInt, IsString } from 'class-validator';

export class CreateMentorLogbookDto {
  @IsString()
  activity: string;

  @IsString()
  activityDetail: string;

  @IsString()
  documentation: string;

  @IsString()
  obstacle: string;

  @IsInt()
  userId: number;

  @IsInt()
  sessionId: number;
}
