import { Module } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { PertemuansController } from './pertemuans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { KelassModule } from 'src/kelass/kelass.module';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pertemuan, Kelas])],
  controllers: [PertemuansController],
  providers: [PertemuansService],
  exports: [PertemuansService]
})
export class PertemuansModule {}
