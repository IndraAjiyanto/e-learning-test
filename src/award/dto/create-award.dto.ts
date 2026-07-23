import { IsArray, IsNumber } from 'class-validator';

export class CreateAwardDto {
  @IsArray()
  content: string[];

  @IsArray()
  details: string[];

  @IsNumber()
  award_order: number;
}
