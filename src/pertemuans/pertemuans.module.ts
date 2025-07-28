import { Module } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { PertemuansController } from './pertemuans.controller';

@Module({
  controllers: [PertemuansController],
  providers: [PertemuansService],
})
export class PertemuansModule {}
