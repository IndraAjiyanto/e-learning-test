import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentAnswersDto } from './create-assignment_answers.dto';

export class UpdateAssignmentAnswersDto extends PartialType(
  CreateAssignmentAnswersDto,
) {}
