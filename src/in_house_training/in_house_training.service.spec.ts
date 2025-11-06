import { Test, TestingModule } from '@nestjs/testing';
import { InHouseTrainingService } from './in_house_training.service';

describe('InHouseTrainingService', () => {
  let service: InHouseTrainingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InHouseTrainingService],
    }).compile();

    service = module.get<InHouseTrainingService>(InHouseTrainingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
