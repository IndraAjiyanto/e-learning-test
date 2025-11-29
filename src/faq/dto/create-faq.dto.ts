import { IsArray, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsArray()
  question: string[];

  @IsArray()
  answer: string[];
}
