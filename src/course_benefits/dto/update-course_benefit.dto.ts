import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseBenefitDto } from './create-course_benefit.dto';

export class UpdateCourseBenefitDto extends PartialType(
  CreateCourseBenefitDto,
) {}
