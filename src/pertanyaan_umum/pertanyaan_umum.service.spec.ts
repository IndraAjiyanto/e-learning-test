import { Test, TestingModule } from '@nestjs/testing';
import { PertanyaanUmumService } from './pertanyaan_umum.service';

describe('PertanyaanUmumService', () => {
  let service: PertanyaanUmumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PertanyaanUmumService],
    }).compile();

    service = module.get<PertanyaanUmumService>(PertanyaanUmumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
