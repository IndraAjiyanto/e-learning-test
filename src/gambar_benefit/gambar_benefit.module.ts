import { Module } from '@nestjs/common';
import { GambarBenefitService } from './gambar_benefit.service';
import { GambarBenefitController } from './gambar_benefit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([GambarBenefit]), CommonModule],
  controllers: [GambarBenefitController],
  providers: [GambarBenefitService],
})
export class GambarBenefitModule {}
