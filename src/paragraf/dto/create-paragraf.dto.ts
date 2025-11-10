import { IsNumber, IsString } from 'class-validator';

export class CreateParagrafDto {
  @IsString()
  paragraf: string;

  @IsNumber()
  p_ke: number;
}
