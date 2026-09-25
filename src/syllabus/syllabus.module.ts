import { Module } from '@nestjs/common';
import { SyllabusService } from './syllabus.service';
import { SyllabusController } from './syllabus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Syllabus } from 'src/entities/syllabus.entity';
import { SyllabusProgress } from 'src/entities/syllabus_progress.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Score } from 'src/entities/score.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { QuizModule } from 'src/quiz/quiz.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Syllabus,
      SyllabusProgress,
      Course,
      User,
      UserCourse,
      Quiz,
      Score,
    ]),
    CoursesModule,
    QuizModule,
  ],
  controllers: [SyllabusController],
  providers: [SyllabusService],
  exports: [SyllabusService],
})
export class SyllabusModule {}
