import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateParagrafDto {
  @IsArray()
  paragraf: string[];

  @IsNumber()
  p_ke: number;
}
