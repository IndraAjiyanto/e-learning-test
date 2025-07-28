import { PartialType } from '@nestjs/mapped-types';
import { CreateAbsenDto } from './create-absen.dto';

export class UpdateAbsenDto extends PartialType(CreateAbsenDto) {}
