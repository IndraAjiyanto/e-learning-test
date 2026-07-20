import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { MaterialsModule } from 'src/materials/material.module';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { Assignment } from 'src/entities/assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      LogbookMentor,
      Course,
      User,
      Question,
      Weeks,
      Logbook,
      SessionProgress,
      WeekProgress,
      Assignment,
    ]),
    MaterialsModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionsModule {}
