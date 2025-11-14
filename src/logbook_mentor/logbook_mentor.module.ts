import { Module } from '@nestjs/common';
import { LogbookMentorService } from './logbook_mentor.service';
import { LogbookMentorController } from './logbook_mentor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogbookMentor, User, Pertemuan, Kelas]),
    CommonModule,
  ],
  controllers: [LogbookMentorController],
  providers: [LogbookMentorService],
  exports: [LogbookMentorService],
})
export class LogbookMentorModule {}
