import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tentang } from 'src/entities/tentang.entity';
import { TentangService } from './tentang.service';
import { TentangController } from './tentang.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tentang])],
  controllers: [TentangController],
  providers: [TentangService],
  exports: [TentangService],
})
export class TentangModule {}
