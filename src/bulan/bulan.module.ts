import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulanService } from './bulan.service';
import { BulanController } from './bulan.controller';
import { Bulan } from 'src/entities/bulan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bulan])],
  controllers: [BulanController],
  providers: [BulanService],
  exports: [BulanService],
})
export class BulanModule {}
