import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSyllabusDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  content: object;
}

