import { PartialType } from '@nestjs/mapped-types';
import { CreateBulanDto } from './create-bulan.dto';

export class UpdateBulanDto extends PartialType(CreateBulanDto) {}
