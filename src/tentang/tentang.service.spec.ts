import { Test, TestingModule } from '@nestjs/testing';
import { TentangService } from './tentang.service';

describe('TentangService', () => {
  let service: TentangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TentangService],
    }).compile();

    service = module.get<TentangService>(TentangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
