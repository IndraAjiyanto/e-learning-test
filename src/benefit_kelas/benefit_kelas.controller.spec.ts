import { Test, TestingModule } from '@nestjs/testing';
import { BenefitKelasController } from './benefit_kelas.controller';
import { BenefitKelasService } from './benefit_kelas.service';

describe('BenefitKelasController', () => {
  let controller: BenefitKelasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BenefitKelasController],
      providers: [BenefitKelasService],
    }).compile();

    controller = module.get<BenefitKelasController>(BenefitKelasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
