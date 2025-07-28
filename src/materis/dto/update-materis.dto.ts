import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterisDto } from './create-materis.dto';

export class UpdateMaterisDto extends PartialType(CreateMaterisDto) {}
