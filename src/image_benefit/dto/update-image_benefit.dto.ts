import { PartialType } from '@nestjs/mapped-types';
import { CreateImageBenefitDto } from './create-image_benefit.dto';

export class UpdateImageBenefitDto extends PartialType(
  CreateImageBenefitDto,
) {}
