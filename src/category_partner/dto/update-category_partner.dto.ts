import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryPartnerDto } from './create-category_partner.dto';

export class UpdateCategoryPartnerDto extends PartialType(
  CreateCategoryPartnerDto,
) {}
