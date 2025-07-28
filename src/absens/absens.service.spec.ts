import { Test, TestingModule } from '@nestjs/testing';
import { AbsensService } from './absens.service';

describe('AbsensService', () => {
  let service: AbsensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbsensService],
    }).compile();

    service = module.get<AbsensService>(AbsensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
