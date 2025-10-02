import { Module } from '@nestjs/common';
import { BenefitKelasService } from './benefit_kelas.service';
import { BenefitKelasController } from './benefit_kelas.controller';

@Module({
  controllers: [BenefitKelasController],
  providers: [BenefitKelasService],
})
export class BenefitKelasModule {}
