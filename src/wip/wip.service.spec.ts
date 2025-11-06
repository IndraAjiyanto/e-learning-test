import { Test, TestingModule } from '@nestjs/testing';
import { WipService } from './wip.service';

describe('WipService', () => {
  let service: WipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WipService],
    }).compile();

    service = module.get<WipService>(WipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
