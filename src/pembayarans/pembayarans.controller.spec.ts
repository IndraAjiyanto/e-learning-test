import { Test, TestingModule } from '@nestjs/testing';
import { PembayaransController } from './pembayarans.controller';
import { PembayaransService } from './pembayarans.service';

describe('PembayaransController', () => {
  let controller: PembayaransController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PembayaransController],
      providers: [PembayaransService],
    }).compile();

    controller = module.get<PembayaransController>(PembayaransController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
