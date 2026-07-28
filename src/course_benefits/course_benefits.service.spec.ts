import { Test, TestingModule } from '@nestjs/testing';
import { ProgramBenefitService } from './course_benefits.service';

describe('ProgramBenefitService', () => {
  let service: ProgramBenefitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramBenefitService],
    }).compile();

    service = module.get<ProgramBenefitService>(ProgramBenefitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
