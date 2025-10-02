import { Module } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { KategorisController } from './kategoris.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kategori } from 'src/entities/kategori.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kategori])],
  controllers: [KategorisController],
  providers: [KategorisService],
  exports: [KategorisService],
})
export class KategorisModule {}
