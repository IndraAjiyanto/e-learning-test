import { IsArray, IsNumber } from 'class-validator';

export class CreateBackgroundDto {
  @IsArray()
  content: string[];

  @IsArray()
  details: string[];

  @IsNumber()
  backgroundOrder: number;
}
