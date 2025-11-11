import { Test, TestingModule } from '@nestjs/testing';
import { VisiService } from './visi.service';

describe('VisiService', () => {
  let service: VisiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisiService],
    }).compile();

    service = module.get<VisiService>(VisiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
