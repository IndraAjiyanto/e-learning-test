import { PartialType } from '@nestjs/mapped-types';
import { CreatePertanyaanDto } from './create-pertanyaan.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdatePertanyaanDto extends PartialType(CreatePertanyaanDto) {
  @IsString()
  questionText: string;

  @IsString()
  gambar?: string;

  @IsArray()
  @IsString({ each: true })
  answer: string[];
}
