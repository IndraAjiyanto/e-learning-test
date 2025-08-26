import { Module } from '@nestjs/common';
import { TugassService } from './tugass.service';
import { TugassController } from './tugass.controller';

@Module({
  controllers: [TugassController],
  providers: [TugassService],
})
export class TugassModule {}
