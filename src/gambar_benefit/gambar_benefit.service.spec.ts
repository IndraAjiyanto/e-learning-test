import { Test, TestingModule } from '@nestjs/testing';
import { GambarBenefitService } from './gambar_benefit.service';

describe('GambarBenefitService', () => {
  let service: GambarBenefitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GambarBenefitService],
    }).compile();

    service = module.get<GambarBenefitService>(GambarBenefitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
