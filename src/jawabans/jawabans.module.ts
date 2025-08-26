import { Module } from '@nestjs/common';
import { JawabansService } from './jawabans.service';
import { JawabansController } from './jawabans.controller';

@Module({
  controllers: [JawabansController],
  providers: [JawabansService],
})
export class JawabansModule {}
