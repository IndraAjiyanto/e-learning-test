import { Test, TestingModule } from '@nestjs/testing';
import { BiodatasService } from './biodatas.service';

describe('BiodatasService', () => {
  let service: BiodatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiodatasService],
    }).compile();

    service = module.get<BiodatasService>(BiodatasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
