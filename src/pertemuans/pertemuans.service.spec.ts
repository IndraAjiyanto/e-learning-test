import { Test, TestingModule } from '@nestjs/testing';
import { PertemuansService } from './pertemuans.service';

describe('PertemuansService', () => {
  let service: PertemuansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PertemuansService],
    }).compile();

    service = module.get<PertemuansService>(PertemuansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
