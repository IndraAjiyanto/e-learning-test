import { Test, TestingModule } from '@nestjs/testing';
import { ImageBenefitController } from './image_benefit.controller';
import { ImageBenefitService } from './image_benefit.service';

describe('ImageBenefitController', () => {
  let controller: ImageBenefitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageBenefitController],
      providers: [ImageBenefitService],
    }).compile();

    controller = module.get<ImageBenefitController>(ImageBenefitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
