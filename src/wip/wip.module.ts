import { Module } from '@nestjs/common';
import { WipService } from './wip.service';
import { WipController } from './wip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kelas,
      JenisKelas,
      Kategori,
      Alumni,
      PertanyaanUmum,
    ]),
  ],
  controllers: [WipController],
  providers: [WipService],
})
export class WipModule {}
