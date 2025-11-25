import { Test, TestingModule } from '@nestjs/testing';
import { FlowCategoryService } from './flow_category.service';

describe('FlowCategoryService', () => {
  let service: FlowCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlowCategoryService],
    }).compile();

    service = module.get<FlowCategoryService>(FlowCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
