import { Module } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { KategorisController } from './kategoris.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kategori } from 'src/entities/kategori.entity';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { CommonModule } from 'src/common/common.module';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kategori, AlurKelas, BenefitCategory, Kelas]), CommonModule],
  controllers: [KategorisController],
  providers: [KategorisService],
  exports: [KategorisService],
})
export class KategorisModule {}
