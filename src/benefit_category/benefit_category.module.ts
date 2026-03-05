import { Module } from '@nestjs/common';
import { BenefitCategoryService } from './benefit_category.service';
import { BenefitCategoryController } from './benefit_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { Kategori } from 'src/entities/kategori.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BenefitCategory, Kategori])],
  controllers: [BenefitCategoryController],
  providers: [BenefitCategoryService],
})
export class BenefitCategoryModule {}
