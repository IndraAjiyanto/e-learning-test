import { PartialType } from '@nestjs/mapped-types';
import { CreateLogbookMentorDto } from './create-logbook_mentor.dto';

export class UpdateLogbookMentorDto extends PartialType(CreateLogbookMentorDto) {}
