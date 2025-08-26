import { PartialType } from '@nestjs/mapped-types';
import { CreateJawabanTugassDto } from './create-jawaban_tugass.dto';

export class UpdateJawabanTugassDto extends PartialType(CreateJawabanTugassDto) {}
