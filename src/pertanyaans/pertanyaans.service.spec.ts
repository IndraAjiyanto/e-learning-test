import { Test, TestingModule } from '@nestjs/testing';
import { PertanyaansService } from './pertanyaans.service';

describe('PertanyaansService', () => {
  let service: PertanyaansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PertanyaansService],
    }).compile();

    service = module.get<PertanyaansService>(PertanyaansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
