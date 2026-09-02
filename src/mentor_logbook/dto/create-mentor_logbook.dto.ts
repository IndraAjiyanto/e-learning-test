import { IsInt, IsString, IsUUID } from 'class-validator';

export class CreateMentorLogbookDto {
  @IsString()
  activity: string;

  @IsString()
  activityDetail: string;

  @IsString()
  documentation: string;

  @IsString()
  obstacle: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  sessionId: string;
}
