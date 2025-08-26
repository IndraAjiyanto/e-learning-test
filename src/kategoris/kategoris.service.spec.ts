import { Test, TestingModule } from '@nestjs/testing';
import { KategorisService } from './kategoris.service';

describe('KategorisService', () => {
  let service: KategorisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KategorisService],
    }).compile();

    service = module.get<KategorisService>(KategorisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
