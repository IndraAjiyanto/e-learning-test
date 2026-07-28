import { Module } from '@nestjs/common';
import { WeeksService } from './weeks.service';
import { WeeksController } from './weeks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weeks } from 'src/entities/weeks.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Quiz } from 'src/entities/quiz.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Weeks,
      Course,
      User,
      Session,
      WeekProgress,
      UserCourse,
      Quiz,
    ]),
  ],
  controllers: [WeeksController],
  providers: [WeeksService],
  exports: [WeeksService],
})
export class WeeksModule {}
