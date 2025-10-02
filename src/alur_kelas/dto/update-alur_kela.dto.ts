import { PartialType } from '@nestjs/mapped-types';
import { CreateAlurKelaDto } from './create-alur_kela.dto';

export class UpdateAlurKelaDto extends PartialType(CreateAlurKelaDto) {}
