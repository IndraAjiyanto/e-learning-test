import { PartialType } from '@nestjs/mapped-types';
import { CreateIntenshifDto } from './create-intenshif.dto';

export class UpdateIntenshifDto extends PartialType(CreateIntenshifDto) {}
