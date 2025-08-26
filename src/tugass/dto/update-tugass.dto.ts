import { PartialType } from '@nestjs/mapped-types';
import { CreateTugassDto } from './create-tugass.dto';

export class UpdateTugassDto extends PartialType(CreateTugassDto) {}
