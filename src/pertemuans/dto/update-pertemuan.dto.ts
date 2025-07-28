import { PartialType } from '@nestjs/mapped-types';
import { CreatePertemuanDto } from './create-pertemuan.dto';

export class UpdatePertemuanDto extends PartialType(CreatePertemuanDto) {}
