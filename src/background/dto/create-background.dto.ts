import { IsNumber, IsString } from 'class-validator';

export class CreateBackgroundDto {
  @IsString()
  content: string;

  @IsString()
  isi: string;

  @IsNumber()
  background_ke: number;
}
