import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParagrafService } from './paragraf.service';
import { ParagrafController } from './paragraf.controller';
import { Paragraf } from 'src/entities/paragraf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paragraf])],
  controllers: [ParagrafController],
  providers: [ParagrafService],
  exports: [ParagrafService],
})
export class ParagrafModule {}
