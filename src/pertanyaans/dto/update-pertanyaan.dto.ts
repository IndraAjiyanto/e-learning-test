import { PartialType } from '@nestjs/mapped-types';
import { CreatePertanyaanDto } from './create-pertanyaan.dto';

export class UpdatePertanyaanDto extends PartialType(CreatePertanyaanDto) {}
