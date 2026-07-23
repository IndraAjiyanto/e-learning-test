import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorLogbookDto } from './create-mentor_logbook.dto';

export class UpdateMentorLogbookDto extends PartialType(
  CreateMentorLogbookDto,
) {}
