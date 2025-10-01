import { PartialType } from '@nestjs/mapped-types';
import { CreatePertanyaanKelaDto } from './create-pertanyaan_kela.dto';

export class UpdatePertanyaanKelaDto extends PartialType(CreatePertanyaanKelaDto) {}
