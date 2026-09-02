import { IsArray, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateFaqsDto {
  @IsArray()
  question: string[];

  @IsArray()
  answer: string[];

  @IsUUID()
  categoryId: string;
}
