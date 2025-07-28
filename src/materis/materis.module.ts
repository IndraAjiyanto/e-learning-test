import { Module } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { MaterisController } from './materis.controller';

@Module({
  controllers: [MaterisController],
  providers: [MaterisService],
})
export class MaterisModule {}
