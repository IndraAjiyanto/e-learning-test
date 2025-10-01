import { Test, TestingModule } from '@nestjs/testing';
import { PertanyaanKelasService } from './pertanyaan_kelas.service';

describe('PertanyaanKelasService', () => {
  let service: PertanyaanKelasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PertanyaanKelasService],
    }).compile();

    service = module.get<PertanyaanKelasService>(PertanyaanKelasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
