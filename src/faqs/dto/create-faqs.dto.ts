import { IsArray, IsUUID } from 'class-validator';

export class CreateFaqsDto {
  @IsArray()
  question: string[];

  @IsArray()
  answer: string[];

  @IsUUID()
  categoryId: string;
}
