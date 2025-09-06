import { Module } from '@nestjs/common';
import { TugassService } from './tugass.service';
import { TugassController } from './tugass.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tugas, Pertemuan])],
  controllers: [TugassController],
  providers: [TugassService],
})
export class TugassModule {}
