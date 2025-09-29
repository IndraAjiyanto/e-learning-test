import { PartialType } from '@nestjs/mapped-types';
import { CreateKerjaSamaDto } from './create-kerja_sama.dto';

export class UpdateKerjaSamaDto extends PartialType(CreateKerjaSamaDto) {}
