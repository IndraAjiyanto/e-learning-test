import { PartialType } from '@nestjs/mapped-types';
import { CreateGambarBenefitDto } from './create-gambar_benefit.dto';

export class UpdateGambarBenefitDto extends PartialType(CreateGambarBenefitDto) {}
