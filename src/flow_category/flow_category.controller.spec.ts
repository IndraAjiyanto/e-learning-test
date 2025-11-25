import { Test, TestingModule } from '@nestjs/testing';
import { FlowCategoryController } from './flow_category.controller';
import { FlowCategoryService } from './flow_category.service';

describe('FlowCategoryController', () => {
  let controller: FlowCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowCategoryController],
      providers: [FlowCategoryService],
    }).compile();

    controller = module.get<FlowCategoryController>(FlowCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
