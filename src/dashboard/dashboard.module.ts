import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Alumni } from 'src/entities/alumni.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kelas, PertanyaanUmum, Alumni])],
  controllers: [DashboardController],
  providers: [DashboardService],
    exports: [DashboardService]
  
})
export class DashboardModule {}
