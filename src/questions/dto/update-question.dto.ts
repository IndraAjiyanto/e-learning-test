import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsString()
  questionText: string;

  @IsString()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  answer: string[];
}
