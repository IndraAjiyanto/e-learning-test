import { Test, TestingModule } from '@nestjs/testing';
import { JenisKelasController } from './jenis_kelas.controller';
import { JenisKelasService } from './jenis_kelas.service';

describe('JenisKelasController', () => {
  let controller: JenisKelasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JenisKelasController],
      providers: [JenisKelasService],
    }).compile();

    controller = module.get<JenisKelasController>(JenisKelasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
