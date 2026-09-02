import { IsBooleanString, IsDateString, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  topic: string;

  @IsString()
  location: string;

  @IsInt()
  sessionOrder: number;

  @IsDateString()
  date: Date;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBooleanString()
  isFinal: boolean;

  @IsString()
  isFinalCheck: string;

  @IsUUID()
  weeksId: string;
}
