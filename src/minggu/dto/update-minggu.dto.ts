import { PartialType } from '@nestjs/mapped-types';
import { CreateMingguDto } from './create-minggu.dto';

export class UpdateMingguDto extends PartialType(CreateMingguDto) {}
