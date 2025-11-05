import { Test, TestingModule } from '@nestjs/testing';
import { PendaftaranController } from './pendaftaran.controller';
import { PendaftaranService } from './pendaftaran.service';

describe('PendaftaranController', () => {
  let controller: PendaftaranController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendaftaranController],
      providers: [PendaftaranService],
    }).compile();

    controller = module.get<PendaftaranController>(PendaftaranController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
