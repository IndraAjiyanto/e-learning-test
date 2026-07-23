import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseFlowDto } from './create-course_flow.dto';

export class UpdateCourseFlowDto extends PartialType(CreateCourseFlowDto) {}
