import { Module } from '@nestjs/common';
import { BenefitKelasService } from './benefit_kelas.service';
import { BenefitKelasController } from './benefit_kelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitKelas } from 'src/entities/benefit_kelas.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BenefitKelas, Kelas])],
  controllers: [BenefitKelasController],
  providers: [BenefitKelasService],
  exports: [BenefitKelasService],
})
export class BenefitKelasModule {}
