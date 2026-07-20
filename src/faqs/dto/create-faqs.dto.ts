import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateFaqsDto {
  @IsArray()
  question: string[];

  @IsArray()
  answer: string[];

  @IsNumber()
  categoryId: number;
}
