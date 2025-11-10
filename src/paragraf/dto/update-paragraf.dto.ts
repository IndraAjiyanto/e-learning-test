import { PartialType } from '@nestjs/mapped-types';
import { CreateParagrafDto } from './create-paragraf.dto';

export class UpdateParagrafDto extends PartialType(CreateParagrafDto) {}
