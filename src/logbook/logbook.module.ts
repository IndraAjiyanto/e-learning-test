import { Module } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas, Logbook, User, Pertemuan, LogbookMentor])],
  controllers: [LogbookController],
  providers: [LogbookService],
  exports: [LogbookService]
})
export class LogbookModule {}
