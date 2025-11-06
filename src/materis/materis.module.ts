import { Module } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { MaterisController } from './materis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materi } from 'src/entities/materi.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { LibreOfficeService } from 'src/common/config/libreoffice.service';
import { PertemuansModule } from 'src/pertemuans/pertemuans.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Materi, Kelas, Pertemuan]), CommonModule],
  controllers: [MaterisController],
  providers: [MaterisService, LibreOfficeService],
  exports: [MaterisService],
})
export class MaterisModule {}
