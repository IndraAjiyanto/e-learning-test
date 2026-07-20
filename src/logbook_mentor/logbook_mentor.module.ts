import { Module } from '@nestjs/common';
import { LogbookMentorService } from './logbook_mentor.service';
import { LogbookMentorController } from './logbook_mentor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { Course } from 'src/entities/course.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogbookMentor, User, Session, Course]),
    CommonModule,
  ],
  controllers: [LogbookMentorController],
  providers: [LogbookMentorService],
  exports: [LogbookMentorService],
})
export class LogbookMentorModule {}
