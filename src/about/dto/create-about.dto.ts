import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAboutDto {
  @IsNotEmpty()
  @IsArray()
  title: string[];

  @IsNotEmpty()
  @IsArray()
  text: string[];

  @IsOptional()
  @IsString()
  image: string;
}
