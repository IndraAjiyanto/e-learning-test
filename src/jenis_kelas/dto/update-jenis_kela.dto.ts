import { PartialType } from '@nestjs/mapped-types';
import { CreateJenisKelaDto } from './create-jenis_kela.dto';

export class UpdateJenisKelaDto extends PartialType(CreateJenisKelaDto) {}
