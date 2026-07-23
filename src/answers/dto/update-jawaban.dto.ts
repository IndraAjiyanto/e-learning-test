import { PartialType } from '@nestjs/mapped-types';
import { CreateJawabanDto } from './create-jawaban.dto';

export class UpdateJawabanDto extends PartialType(CreateJawabanDto) {}
