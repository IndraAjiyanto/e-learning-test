import { PartialType } from '@nestjs/mapped-types';
import { CreateSertifikatDto } from './create-sertifikat.dto';

export class UpdateSertifikatDto extends PartialType(CreateSertifikatDto) {}
