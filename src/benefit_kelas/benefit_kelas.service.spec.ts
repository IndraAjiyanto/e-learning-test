import { Test, TestingModule } from '@nestjs/testing';
import { BenefitKelasService } from './benefit_kelas.service';

describe('BenefitKelasService', () => {
  let service: BenefitKelasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BenefitKelasService],
    }).compile();

    service = module.get<BenefitKelasService>(BenefitKelasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
