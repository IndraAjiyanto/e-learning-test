import { Module } from '@nestjs/common';
import { BulanService } from './bulan.service';
import { BulanController } from './bulan.controller';

@Module({
  controllers: [BulanController],
  providers: [BulanService],
})
export class BulanModule {}
