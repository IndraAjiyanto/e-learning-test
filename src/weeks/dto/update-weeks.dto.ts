import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeksDto } from './create-weeks.dto';

export class UpdateWeeksDto extends PartialType(CreateWeeksDto) {}
