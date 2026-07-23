import { IsBooleanString, IsInt, IsString } from 'class-validator';

export class CreateWeeksDto {
  @IsString()
  description: string;

  @IsInt()
  weekNumber: number;

  @IsBooleanString()
  isFinal: boolean;

  @IsString()
  isFinalCheck: string;
}
