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
import { KerjaSama } from 'src/entities/kerja_sama.entity';
import { Benefit } from 'src/entities/benefit.entity';
import { Team } from 'src/entities/team.entity';
import { Social } from 'src/entities/social.entity';
import { Blog } from 'src/entities/blog.entity';
import { Tentang } from 'src/entities/tentang.entity';
import { Value } from 'src/entities/value.entity';
import { Visi } from 'src/entities/visi.entity';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Commitment } from 'src/entities/commitment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commitment,
      TeamLead,
      Visi,
      Value,
      Tentang,
      Blog,
      Social,
      Team,
      Benefit,
      Kelas,
      PertanyaanUmum,
      Alumni,
      Portfolio,
      GambarBenefit,
      Kategori,
      JenisKelas,
      KerjaSama,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
