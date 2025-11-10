import { Test, TestingModule } from '@nestjs/testing';
import { BulanService } from './bulan.service';

describe('BulanService', () => {
  let service: BulanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BulanService],
    }).compile();

    service = module.get<BulanService>(BulanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
