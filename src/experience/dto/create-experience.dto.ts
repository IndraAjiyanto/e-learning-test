import { IsNumber, IsString } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  content: string;

  @IsString()
  isi: string;

  @IsNumber()
  experience_ke: number;
}
