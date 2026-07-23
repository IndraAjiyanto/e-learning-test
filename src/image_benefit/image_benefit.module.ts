import { Module } from '@nestjs/common';
import { ImageBenefitService } from './image_benefit.service';
import { ImageBenefitController } from './image_benefit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageBenefit } from 'src/entities/image_benefit.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([ImageBenefit]), CommonModule],
  controllers: [ImageBenefitController],
  providers: [ImageBenefitService],
})
export class ImageBenefitModule {}
