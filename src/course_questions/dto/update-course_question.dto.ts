import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseQuestionDto } from './create-course_question.dto';

export class UpdateCourseQuestionDto extends PartialType(
  CreateCourseQuestionDto,
) {}
