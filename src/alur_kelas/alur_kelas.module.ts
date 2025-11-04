import { Module } from '@nestjs/common';
import { AlurKelasService } from './alur_kelas.service';
import { AlurKelasController } from './alur_kelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlurKelas, Kelas])],
  controllers: [AlurKelasController],
  providers: [AlurKelasService],
})
export class AlurKelasModule {}
