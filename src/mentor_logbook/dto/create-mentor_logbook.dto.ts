import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMentorLogbookDto {
  @IsString()
  activity: string;

  @IsString()
  activityDetail: string;

  @IsString()
  documentation: string;

  @IsString()
  obstacle: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
