import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperiorityDto } from './create-superiority.dto';

export class UpdateSuperiorityDto extends PartialType(CreateSuperiorityDto) {}
