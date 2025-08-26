import { Module } from '@nestjs/common';
import { JawabanTugassService } from './jawaban_tugass.service';
import { JawabanTugassController } from './jawaban_tugass.controller';

@Module({
  controllers: [JawabanTugassController],
  providers: [JawabanTugassService],
})
export class JawabanTugassModule {}
