import { IsArray, IsNumber } from 'class-validator';

export class CreateMissionDto {
  @IsArray()
  content: string[];

  @IsNumber()
  missionOrder: number;

  @IsArray()
  items: string[];
}
