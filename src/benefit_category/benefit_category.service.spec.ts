import { Test, TestingModule } from '@nestjs/testing';
import { BenefitCategoryService } from './benefit_category.service';

describe('BenefitCategoryService', () => {
  let service: BenefitCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BenefitCategoryService],
    }).compile();

    service = module.get<BenefitCategoryService>(BenefitCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
