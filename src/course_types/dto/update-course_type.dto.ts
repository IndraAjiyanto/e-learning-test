import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateCourseTypeDto } from './create-course_type.dto';

export class UpdateCourseTypeDto extends PartialType(CreateCourseTypeDto) {
  @IsOptional()
  @IsEnum(['hacker', 'hipster', 'hustler'], {
    message: 'type must be one of: hacker, hipster, hustler',
  })
  type?: 'hacker' | 'hipster' | 'hustler';
}
