import { Module } from '@nestjs/common';
import { LogbookMentorService } from './logbook_mentor.service';
import { LogbookMentorController } from './logbook_mentor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LogbookMentor])],
  controllers: [LogbookMentorController],
  providers: [LogbookMentorService],
  exports: [LogbookMentorService]
})
export class LogbookMentorModule {}
