import { Test, TestingModule } from '@nestjs/testing';
import { CicilanService } from './cicilan.service';

describe('CicilanService', () => {
  let service: CicilanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CicilanService],
    }).compile();

    service = module.get<CicilanService>(CicilanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
