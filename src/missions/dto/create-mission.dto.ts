import { IsArray, IsNumber } from 'class-validator';

export class CreateMissionDto {
  @IsArray()
  content: string[];

  @IsNumber()
  mission_order: number;

  @IsArray()
  items: string[];
}
