import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService],
    exports: [TranslationService],
})
export class TranslationModule {}
