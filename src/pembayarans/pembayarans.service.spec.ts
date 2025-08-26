import { Test, TestingModule } from '@nestjs/testing';
import { PembayaransService } from './pembayarans.service';

describe('PembayaransService', () => {
  let service: PembayaransService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PembayaransService],
    }).compile();

    service = module.get<PembayaransService>(PembayaransService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
