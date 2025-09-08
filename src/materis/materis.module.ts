import { Module } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { MaterisController } from './materis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materi } from 'src/entities/materi.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { ConvertApiService } from 'src/common/config/convertapi.service';
import { PertemuansModule } from 'src/pertemuans/pertemuans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Materi, Kelas, Pertemuan])],
  controllers: [MaterisController],
  providers: [MaterisService, ConvertApiService],
  exports: [MaterisService],
})
export class MaterisModule {}
