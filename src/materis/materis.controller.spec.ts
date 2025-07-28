import { Test, TestingModule } from '@nestjs/testing';
import { MaterisController } from './materis.controller';
import { MaterisService } from './materis.service';

describe('MaterisController', () => {
  let controller: MaterisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterisController],
      providers: [MaterisService],
    }).compile();

    controller = module.get<MaterisController>(MaterisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
