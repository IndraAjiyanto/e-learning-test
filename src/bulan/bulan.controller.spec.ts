import { Test, TestingModule } from '@nestjs/testing';
import { BulanController } from './bulan.controller';
import { BulanService } from './bulan.service';

describe('BulanController', () => {
  let controller: BulanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulanController],
      providers: [BulanService],
    }).compile();

    controller = module.get<BulanController>(BulanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
