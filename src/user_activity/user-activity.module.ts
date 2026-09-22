import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from 'src/entities/user_activity.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Material } from 'src/entities/materials.entity';
import { UserActivityService } from './user-activity.service';
import { UserActivityMiddleware } from './user-activity.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserActivity,
      UserCourse,
      Course,
      Session,
      Quiz,
      Weeks,
      Logbook,
      Material,
    ]),
  ],
  providers: [UserActivityService, UserActivityMiddleware],
  exports: [UserActivityService],
})
export class UserActivityModule {}
