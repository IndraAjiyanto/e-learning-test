import { Module } from '@nestjs/common';
import { ParagrafService } from './paragraf.service';
import { ParagrafController } from './paragraf.controller';

@Module({
  controllers: [ParagrafController],
  providers: [ParagrafService],
})
export class ParagrafModule {}
