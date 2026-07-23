import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseTypeDto } from './create-course_type.dto';

export class UpdateCourseTypeDto extends PartialType(CreateCourseTypeDto) {}
