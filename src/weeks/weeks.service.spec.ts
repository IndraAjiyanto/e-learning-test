import { Test, TestingModule } from '@nestjs/testing';
import { WeeksService } from './weeks.service';

describe('WeeksService', () => {
  let service: WeeksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeksService],
    }).compile();

    service = module.get<WeeksService>(WeeksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
