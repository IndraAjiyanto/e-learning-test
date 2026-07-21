import { Test, TestingModule } from '@nestjs/testing';
import { ImageBenefitService } from './image_benefit.service';

describe('ImageBenefitService', () => {
  let service: ImageBenefitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageBenefitService],
    }).compile();

    service = module.get<ImageBenefitService>(ImageBenefitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
