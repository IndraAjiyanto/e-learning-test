import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateExperienceDto {
  @IsArray()
  content: string[];

  @IsArray()
  isi: string[];

  @IsNumber()
  experience_ke: number;
}
