import { Test, TestingModule } from '@nestjs/testing';
import { PertanyaanKelasController } from './pertanyaan_kelas.controller';
import { PertanyaanKelasService } from './pertanyaan_kelas.service';

describe('PertanyaanKelasController', () => {
  let controller: PertanyaanKelasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PertanyaanKelasController],
      providers: [PertanyaanKelasService],
    }).compile();

    controller = module.get<PertanyaanKelasController>(PertanyaanKelasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
