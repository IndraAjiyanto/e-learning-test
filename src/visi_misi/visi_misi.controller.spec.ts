import { Test, TestingModule } from '@nestjs/testing';
import { VisiMisiController } from './visi_misi.controller';
import { VisiMisiService } from './visi_misi.service';

describe('VisiMisiController', () => {
  let controller: VisiMisiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisiMisiController],
      providers: [VisiMisiService],
    }).compile();

    controller = module.get<VisiMisiController>(VisiMisiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
