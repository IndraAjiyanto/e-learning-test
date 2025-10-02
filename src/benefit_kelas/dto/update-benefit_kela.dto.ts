import { PartialType } from '@nestjs/mapped-types';
import { CreateBenefitKelaDto } from './create-benefit_kela.dto';

export class UpdateBenefitKelaDto extends PartialType(CreateBenefitKelaDto) {}
