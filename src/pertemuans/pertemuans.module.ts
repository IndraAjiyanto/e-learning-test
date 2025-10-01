import { Module } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { PertemuansController } from './pertemuans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { MaterisModule } from 'src/materis/materis.module';
import { Minggu } from 'src/entities/minggu.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pertemuan, LogbookMentor ,Kelas, User, Pertanyaan, Minggu, Logbook]), MaterisModule],
  controllers: [PertemuansController],
  providers: [PertemuansService],
  exports: [PertemuansService]
})
export class PertemuansModule {}