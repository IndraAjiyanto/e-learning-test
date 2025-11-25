import { PartialType } from '@nestjs/mapped-types';
import { CreateFlowCategoryDto } from './create-flow_category.dto';

export class UpdateFlowCategoryDto extends PartialType(CreateFlowCategoryDto) {}
