import { Module } from '@nestjs/common';
import { AttendanceService } from './attendances.service';
import { AttendanceController } from './attendances.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionProgress,
      Attendance,
      User,
      Session,
      Course,
      SessionProgress,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendancesModule {}
