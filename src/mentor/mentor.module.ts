import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Mentors } from 'src/entities/mentor.entity';
import { CommonModule } from 'src/common/common.module';
import { Technology } from 'src/entities/technology.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mentors, Course, Technology]), CommonModule],
  controllers: [MentorController],
  providers: [MentorService],
  exports: [MentorService],
})
export class MentorModule {}
