import { Module } from '@nestjs/common';
import { BiodatasService } from './biodatas.service';
import { BiodatasController } from './biodatas.controller';

@Module({
  controllers: [BiodatasController],
  providers: [BiodatasService],
})
export class BiodatasModule {}
