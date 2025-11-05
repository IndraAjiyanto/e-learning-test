import { PartialType } from '@nestjs/mapped-types';
import { CreatePendaftaranDto } from './create-pendaftaran.dto';

export class UpdatePendaftaranDto extends PartialType(CreatePendaftaranDto) {}
