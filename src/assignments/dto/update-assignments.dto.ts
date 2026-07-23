import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentsDto } from './create-assignments.dto';

export class UpdateAssignmentsDto extends PartialType(CreateAssignmentsDto) {}
