import {
  IsString,
  IsDateString,
  IsInt,
  IsBooleanString,
} from 'class-validator';

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
  startDate: string;

  @IsString()
  endDate: string;

  @IsBooleanString()
  isFinal: boolean;

  @IsString()
  isFinalCheck: string;

  @IsInt()
  weeksId: number;
}
