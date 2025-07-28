import { Test, TestingModule } from '@nestjs/testing';
import { KelassService } from './kelass.service';

describe('KelassService', () => {
  let service: KelassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KelassService],
    }).compile();

    service = module.get<KelassService>(KelassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
