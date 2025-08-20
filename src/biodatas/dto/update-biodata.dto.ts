import { PartialType } from '@nestjs/mapped-types';
import { CreateBiodataDto } from './create-biodata.dto';

export class UpdateBiodataDto extends PartialType(CreateBiodataDto) {}
