import { Test, TestingModule } from '@nestjs/testing';
import { ParagrafService } from './paragraf.service';

describe('ParagrafService', () => {
  let service: ParagrafService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParagrafService],
    }).compile();

    service = module.get<ParagrafService>(ParagrafService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
