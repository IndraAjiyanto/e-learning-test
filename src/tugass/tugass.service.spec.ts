import { Test, TestingModule } from '@nestjs/testing';
import { TugassService } from './tugass.service';

describe('TugassService', () => {
  let service: TugassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TugassService],
    }).compile();

    service = module.get<TugassService>(TugassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
