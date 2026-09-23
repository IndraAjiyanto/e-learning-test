import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSyllabusDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isFinal?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsNumber()
  syllabusNumber?: number;
}

