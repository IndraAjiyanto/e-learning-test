import { Module } from '@nestjs/common';
import { TugassService } from './tugass.service';
import { TugassController } from './tugass.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tugas, Pertemuan]), CommonModule],
  controllers: [TugassController],
  providers: [TugassService],
})
export class TugassModule {}
