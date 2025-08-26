import { Module } from '@nestjs/common';
import { PertanyaansService } from './pertanyaans.service';
import { PertanyaansController } from './pertanyaans.controller';

@Module({
  controllers: [PertanyaansController],
  providers: [PertanyaansService],
})
export class PertanyaansModule {}
