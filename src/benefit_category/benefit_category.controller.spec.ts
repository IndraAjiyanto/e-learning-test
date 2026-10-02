import { Test, TestingModule } from '@nestjs/testing';
import { BenefitCategoryController } from './benefit_category.controller';
import { BenefitCategoryService } from './benefit_category.service';

describe('BenefitCategoryController', () => {
  let controller: BenefitCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BenefitCategoryController],
      providers: [BenefitCategoryService],
    }).compile();

    controller = module.get<BenefitCategoryController>(
      BenefitCategoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
