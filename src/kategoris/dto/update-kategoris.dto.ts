import { PartialType } from '@nestjs/mapped-types';
import { CreateKategorisDto } from './create-kategoris.dto';

export class UpdateKategorisDto extends PartialType(CreateKategorisDto) {}
