import { Test, TestingModule } from '@nestjs/testing';
import { KerjaSamaController } from './kerja_sama.controller';
import { KerjaSamaService } from './kerja_sama.service';

describe('KerjaSamaController', () => {
  let controller: KerjaSamaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KerjaSamaController],
      providers: [KerjaSamaService],
    }).compile();

    controller = module.get<KerjaSamaController>(KerjaSamaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
