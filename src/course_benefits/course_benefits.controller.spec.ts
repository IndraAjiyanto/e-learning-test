import { Test, TestingModule } from '@nestjs/testing';
import { ProgramBenefitController } from './course_benefits.controller';
import { ProgramBenefitService } from './course_benefits.service';

describe('ProgramBenefitController', () => {
  let controller: ProgramBenefitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramBenefitController],
      providers: [ProgramBenefitService],
    }).compile();

    controller = module.get<ProgramBenefitController>(ProgramBenefitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
