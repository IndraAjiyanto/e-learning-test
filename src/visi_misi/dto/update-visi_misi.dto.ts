import { PartialType } from '@nestjs/mapped-types';
import { CreateVisiMisiDto } from './create-visi_misi.dto';

export class UpdateVisiMisiDto extends PartialType(CreateVisiMisiDto) {}
