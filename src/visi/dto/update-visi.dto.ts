import { PartialType } from '@nestjs/mapped-types';
import { CreateVisiDto } from './create-visi.dto';

export class UpdateVisiDto extends PartialType(CreateVisiDto) {}
