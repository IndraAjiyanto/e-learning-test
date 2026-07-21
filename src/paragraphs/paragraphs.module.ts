import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParagraphsService } from './paragraphs.service';
import { ParagraphsController } from './paragraphs.controller';
import { Paragraph } from 'src/entities/paragraph.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paragraph])],
  controllers: [ParagraphsController],
  providers: [ParagraphsService],
  exports: [ParagraphsService],
})
export class ParagraphsModule {}
