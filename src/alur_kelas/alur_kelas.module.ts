import { Module } from '@nestjs/common';
import { AlurKelasService } from './alur_kelas.service';
import { AlurKelasController } from './alur_kelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { Kategori } from 'src/entities/kategori.entity';

@Module({
      imports: [TypeOrmModule.forFeature([AlurKelas, Kategori])],
  controllers: [AlurKelasController],
  providers: [AlurKelasService],
})
export class AlurKelasModule {}
