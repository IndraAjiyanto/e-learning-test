import { PartialType } from '@nestjs/mapped-types';
import { CreateKelassDto } from './create-kelass.dto';

export class UpdateKelassDto extends PartialType(CreateKelassDto) {}
