import { IsArray, IsNumber } from 'class-validator';

export class CreateExperienceDto {
  @IsArray()
  content: string[];

  @IsArray()
  details: string[];

  @IsNumber()
  experienceOrder: number;
}
