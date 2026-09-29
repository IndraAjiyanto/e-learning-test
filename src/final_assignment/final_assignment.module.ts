import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalAssignment } from 'src/entities/final_assignment.entity';
import { UserAssignment } from 'src/entities/user_assignment.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { FinalAssignmentService } from './final_assignment.service';
import { FinalAssignmentController } from './final_assignment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinalAssignment,
      UserAssignment,
      Course,
      User,
      UserCourse,
    ]),
  ],
  controllers: [FinalAssignmentController],
  providers: [FinalAssignmentService],
  exports: [FinalAssignmentService],
})
export class FinalAssignmentModule {}

