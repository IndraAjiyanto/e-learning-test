import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateBackgroundDto {
  @IsArray()
  content: string[];

  @IsArray()
  isi: string[];

  @IsNumber()
  background_ke: number;
}
