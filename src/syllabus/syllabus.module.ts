import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyllabusService } from './syllabus.service';
import { Course } from 'src/entities/course.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { SyllabusMaterial } from 'src/entities/syllabus_material.entity';
import { SyllabusAssignment } from 'src/entities/syllabus_assignment.entity';
import { SyllabusAnswerTask } from 'src/entities/syllabus_answer_task.entity';
import { SyllabusComment } from 'src/entities/syllabus_comment.entity';
import { SyllabusLogbook } from 'src/entities/syllabus_logbook.entity';
import { SyllabusProgress } from 'src/entities/syllabus_progress.entity';

/**
 * Jalur belajar non-bootcamp. Belum punya controller - S1 hanya menyediakan
 * aturannya; antarmukanya S3 (student) dan S4 (admin).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Syllabus,
      SyllabusMaterial,
      SyllabusAssignment,
      SyllabusAnswerTask,
      SyllabusComment,
      SyllabusLogbook,
      SyllabusProgress,
    ]),
  ],
  providers: [SyllabusService],
  exports: [SyllabusService],
})
export class SyllabusModule {}
