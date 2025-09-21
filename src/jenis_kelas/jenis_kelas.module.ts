import { Module } from '@nestjs/common';
import { JenisKelasService } from './jenis_kelas.service';
import { JenisKelasController } from './jenis_kelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';

@Module({
      imports: [TypeOrmModule.forFeature([JenisKelas])],
  controllers: [JenisKelasController],
  providers: [JenisKelasService],
  exports: [JenisKelasService]
})
export class JenisKelasModule {}
