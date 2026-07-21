import { PartialType } from '@nestjs/mapped-types';
import { CreateParagraphsDto } from './create-paragraphs.dto';

export class UpdateParagraphsDto extends PartialType(CreateParagraphsDto) {}
