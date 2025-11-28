import { Module } from '@nestjs/common';
import { TentangService } from './tentang.service';
import { TentangController } from './tentang.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tentang } from 'src/entities/tentang.entity';
import { CommonModule } from 'src/common/common.module';
import { Translation } from 'src/entities/translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tentang, Translation]), CommonModule],
  controllers: [TentangController],
  providers: [TentangService],
})
export class TentangModule {}
