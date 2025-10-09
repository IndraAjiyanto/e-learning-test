import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portfolio } from 'src/entities/portfolio.entity';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kelas, PertanyaanUmum, Alumni, Portfolio, GambarBenefit, Kategori, JenisKelas])],
  controllers: [DashboardController],
  providers: [DashboardService],
    exports: [DashboardService]
  
})
export class DashboardModule {}
