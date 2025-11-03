import { Test, TestingModule } from '@nestjs/testing';
import { GambarBenefitController } from './gambar_benefit.controller';
import { GambarBenefitService } from './gambar_benefit.service';

describe('GambarBenefitController', () => {
  let controller: GambarBenefitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GambarBenefitController],
      providers: [GambarBenefitService],
    }).compile();

    controller = module.get<GambarBenefitController>(GambarBenefitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
