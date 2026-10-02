import { Module } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { CommonModule } from 'src/common/common.module';
import { Quiz } from 'src/entities/quiz.entity';
import { QuizProgress } from 'src/entities/quiz_progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionProgress,
      Course,
      Logbook,
      User,
      Session,
      MentorLogbook,
      Quiz,
      QuizProgress,
    ]),
    CommonModule,
  ],
  controllers: [LogbookController],
  providers: [LogbookService],
  exports: [LogbookService],
})
export class LogbookModule {}
