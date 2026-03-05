import { Module } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { KategorisController } from './kategoris.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kategori } from 'src/entities/kategori.entity';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { CommonModule } from 'src/common/common.module';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { FlowCategory } from 'src/entities/flow_category.entity';
import { Superiority } from 'src/entities/superiority.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kategori,
      Superiority,
      AlurKelas,
      BenefitCategory,
      Kelas,
      JenisKelas,
      Alumni,
      PertanyaanUmum,
      FlowCategory,
    ]),
    CommonModule,
  ],
  controllers: [KategorisController],
  providers: [KategorisService],
  exports: [KategorisService],
})
export class KategorisModule {}
