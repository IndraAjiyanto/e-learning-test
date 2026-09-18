import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyllabusService } from './syllabus.service';
import { SyllabusController } from './syllabus.controller';
import { Course } from 'src/entities/course.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { User } from 'src/entities/user.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { SyllabusMaterial } from 'src/entities/syllabus_material.entity';
import { SyllabusAssignment } from 'src/entities/syllabus_assignment.entity';
import { SyllabusAnswerTask } from 'src/entities/syllabus_answer_task.entity';
import { SyllabusComment } from 'src/entities/syllabus_comment.entity';
import { SyllabusLogbook } from 'src/entities/syllabus_logbook.entity';
import { SyllabusProgress } from 'src/entities/syllabus_progress.entity';

/**
 * Jalur belajar non-bootcamp. Controller student ada di S3; sisi admin S4.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      UserCourse,
      User,
      Syllabus,
      SyllabusMaterial,
      SyllabusAssignment,
      SyllabusAnswerTask,
      SyllabusComment,
      SyllabusLogbook,
      SyllabusProgress,
    ]),
  ],
  controllers: [SyllabusController],
  providers: [SyllabusService],
  exports: [SyllabusService],
})
export class SyllabusModule {}
