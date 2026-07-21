import { IsArray, IsNumber } from 'class-validator';

export class CreateParagraphsDto {
  @IsArray()
  paragraphs: string[];

  @IsNumber()
  p_ke: number;
}
