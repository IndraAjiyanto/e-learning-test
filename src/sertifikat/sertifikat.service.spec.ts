import { Test, TestingModule } from '@nestjs/testing';
import { SertifikatService } from './sertifikat.service';

describe('SertifikatService', () => {
  let service: SertifikatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SertifikatService],
    }).compile();

    service = module.get<SertifikatService>(SertifikatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
