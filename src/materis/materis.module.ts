import { Module } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { MaterisController } from './materis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materi } from 'src/entities/materi.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Materi, Kelas])],
  controllers: [MaterisController],
  providers: [MaterisService],
  exports: [MaterisService],
})
export class MaterisModule {}
