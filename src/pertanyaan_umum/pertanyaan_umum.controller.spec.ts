import { Test, TestingModule } from '@nestjs/testing';
import { PertanyaanUmumController } from './pertanyaan_umum.controller';
import { PertanyaanUmumService } from './pertanyaan_umum.service';

describe('PertanyaanUmumController', () => {
  let controller: PertanyaanUmumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PertanyaanUmumController],
      providers: [PertanyaanUmumService],
    }).compile();

    controller = module.get<PertanyaanUmumController>(PertanyaanUmumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
