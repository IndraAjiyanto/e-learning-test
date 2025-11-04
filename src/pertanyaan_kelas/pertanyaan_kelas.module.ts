import { Module } from '@nestjs/common';
import { PertanyaanKelasService } from './pertanyaan_kelas.service';
import { PertanyaanKelasController } from './pertanyaan_kelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PertanyaanKelas } from 'src/entities/pertanyaan_kelas.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PertanyaanKelas, Kelas])],
  controllers: [PertanyaanKelasController],
  providers: [PertanyaanKelasService],
  exports: [PertanyaanKelasService],
})
export class PertanyaanKelasModule {}
