import { Module } from '@nestjs/common';
import { CicilanService } from './cicilan.service';
import { CicilanController } from './cicilan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cicilan } from '../entities/cicilan.entity';
import { Kelas } from '../entities/kelas.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cicilan, Kelas, Pembayaran])],
  controllers: [CicilanController],
  providers: [CicilanService],
  exports: [CicilanService],
})
export class CicilanModule {}
