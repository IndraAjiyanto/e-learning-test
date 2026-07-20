import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParagrafService } from './paragraf.service';
import { ParagrafController } from './paragraf.controller';
import { Paragraph } from 'src/entities/paragraph.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paragraph])],
  controllers: [ParagrafController],
  providers: [ParagrafService],
  exports: [ParagrafService],
})
export class ParagrafModule {}
