import { Module } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { KategorisController } from './kategoris.controller';

@Module({
  controllers: [KategorisController],
  providers: [KategorisService],
  exports: [KategorisService],
})
export class KategorisModule {}
