import { Module } from '@nestjs/common';
import { TeknologiService } from './teknologi.service';
import { TeknologiController } from './teknologi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teknologi } from 'src/entities/teknologi.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Teknologi]), CommonModule],
  controllers: [TeknologiController],
  providers: [TeknologiService],
  exports: [TeknologiService],
})
export class TeknologiModule {}
