import { Test, TestingModule } from '@nestjs/testing';
import { SertifikatController } from './sertifikat.controller';
import { SertifikatService } from './sertifikat.service';

describe('SertifikatController', () => {
  let controller: SertifikatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SertifikatController],
      providers: [SertifikatService],
    }).compile();

    controller = module.get<SertifikatController>(SertifikatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
