import { Module } from '@nestjs/common';
import { MentorLogbookService } from './mentor_logbook.service';
import { MentorLogbookController } from './mentor_logbook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { Course } from 'src/entities/course.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentorLogbook, User, Session, Course]),
    CommonModule,
  ],
  controllers: [MentorLogbookController],
  providers: [MentorLogbookService],
  exports: [MentorLogbookService],
})
export class MentorLogbookModule {}
