import { Test, TestingModule } from '@nestjs/testing';
import { WipController } from './wip.controller';
import { WipService } from './wip.service';

describe('WipController', () => {
  let controller: WipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WipController],
      providers: [WipService],
    }).compile();

    controller = module.get<WipController>(WipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
