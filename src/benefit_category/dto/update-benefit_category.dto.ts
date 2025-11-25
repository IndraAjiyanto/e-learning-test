import { PartialType } from '@nestjs/mapped-types';
import { CreateBenefitCategoryDto } from './create-benefit_category.dto';

export class UpdateBenefitCategoryDto extends PartialType(CreateBenefitCategoryDto) {}
