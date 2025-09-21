import { Test, TestingModule } from '@nestjs/testing';
import { JenisKelasService } from './jenis_kelas.service';

describe('JenisKelasService', () => {
  let service: JenisKelasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JenisKelasService],
    }).compile();

    service = module.get<JenisKelasService>(JenisKelasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
