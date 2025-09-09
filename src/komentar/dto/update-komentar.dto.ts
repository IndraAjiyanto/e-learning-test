import { PartialType } from '@nestjs/mapped-types';
import { CreateKomentarDto } from './create-komentar.dto';

export class UpdateKomentarDto extends PartialType(CreateKomentarDto) {}
