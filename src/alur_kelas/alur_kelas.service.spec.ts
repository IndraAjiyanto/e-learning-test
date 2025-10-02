import { Test, TestingModule } from '@nestjs/testing';
import { AlurKelasService } from './alur_kelas.service';

describe('AlurKelasService', () => {
  let service: AlurKelasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlurKelasService],
    }).compile();

    service = module.get<AlurKelasService>(AlurKelasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
