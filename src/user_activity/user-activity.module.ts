import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from 'src/entities/user_activity.entity';
import { ActivityLog } from 'src/entities/activity_log.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { UserActivityService } from './user-activity.service';
import { UserActivityMiddleware } from './user-activity.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserActivity, ActivityLog, UserCourse]),
  ],
  providers: [UserActivityService, UserActivityMiddleware],
  exports: [UserActivityService],
})
export class UserActivityModule {}