import { Module } from '@nestjs/common';
import { BenefitCategoryService } from './benefit_category.service';
import { BenefitCategoryController } from './benefit_category.controller';

@Module({
  controllers: [BenefitCategoryController],
  providers: [BenefitCategoryService],
})
export class BenefitCategoryModule {}
