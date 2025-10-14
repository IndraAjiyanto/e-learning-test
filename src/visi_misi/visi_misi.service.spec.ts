import { Test, TestingModule } from '@nestjs/testing';
import { VisiMisiService } from './visi_misi.service';

describe('VisiMisiService', () => {
  let service: VisiMisiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisiMisiService],
    }).compile();

    service = module.get<VisiMisiService>(VisiMisiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
