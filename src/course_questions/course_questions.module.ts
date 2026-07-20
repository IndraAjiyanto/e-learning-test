import { Module } from '@nestjs/common';
import { CourseQuestionsService } from './course_questions.service';
import { CourseQuestionsController } from './course_questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseQuestions } from 'src/entities/course_question.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseQuestions, Course])],
  controllers: [CourseQuestionsController],
  providers: [CourseQuestionsService],
  exports: [CourseQuestionsService],
})
export class CourseQuestionsModule {}
