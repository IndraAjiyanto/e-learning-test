import { Test, TestingModule } from '@nestjs/testing';
import { AlurKelasController } from './alur_kelas.controller';
import { AlurKelasService } from './alur_kelas.service';

describe('AlurKelasController', () => {
  let controller: AlurKelasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlurKelasController],
      providers: [AlurKelasService],
    }).compile();

    controller = module.get<AlurKelasController>(AlurKelasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
