import { Module } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { KelassController } from './kelass.controller';

@Module({
  controllers: [KelassController],
  providers: [KelassService],
})
export class KelassModule {}
