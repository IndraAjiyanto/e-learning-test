import { IsArray, IsNumber } from 'class-validator';

export class CreateAwardDto {
  @IsArray()
  content: string[];

  @IsArray()
  isi: string[];

  @IsNumber()
  award_ke: number;
}
