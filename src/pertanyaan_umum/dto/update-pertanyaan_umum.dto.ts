import { PartialType } from '@nestjs/mapped-types';
import { CreatePertanyaanUmumDto } from './create-pertanyaan_umum.dto';

export class UpdatePertanyaanUmumDto extends PartialType(CreatePertanyaanUmumDto) {}
