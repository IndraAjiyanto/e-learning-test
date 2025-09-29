import { Test, TestingModule } from '@nestjs/testing';
import { KerjaSamaService } from './kerja_sama.service';

describe('KerjaSamaService', () => {
  let service: KerjaSamaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KerjaSamaService],
    }).compile();

    service = module.get<KerjaSamaService>(KerjaSamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
