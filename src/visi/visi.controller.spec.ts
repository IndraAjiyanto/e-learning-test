import { Test, TestingModule } from '@nestjs/testing';
import { VisiController } from './visi.controller';
import { VisiService } from './visi.service';

describe('VisiController', () => {
  let controller: VisiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisiController],
      providers: [VisiService],
    }).compile();

    controller = module.get<VisiController>(VisiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
