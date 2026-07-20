import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramBenefitDto } from './create-benefit_kela.dto';

export class UpdateProgramBenefitDto extends PartialType(CreateProgramBenefitDto) {}
