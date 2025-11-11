import { PartialType } from '@nestjs/mapped-types';
import { CreateBackgroundDto } from './create-background.dto';

export class UpdateBackgroundDto extends PartialType(CreateBackgroundDto) {}
