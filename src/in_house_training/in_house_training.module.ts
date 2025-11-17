import { Module } from '@nestjs/common';
import { InHouseTrainingService } from './in_house_training.service';
import { InHouseTrainingController } from './in_house_training.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kelas, JenisKelas, Kategori, PertanyaanUmum]),
  ],
  controllers: [InHouseTrainingController],
  providers: [InHouseTrainingService],
})
export class InHouseTrainingModule {}
