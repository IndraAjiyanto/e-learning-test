import { Test, TestingModule } from '@nestjs/testing';
import { KomentarService } from './komentar.service';

describe('KomentarService', () => {
  let service: KomentarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KomentarService],
    }).compile();

    service = module.get<KomentarService>(KomentarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
