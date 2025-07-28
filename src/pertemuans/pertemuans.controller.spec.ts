import { Test, TestingModule } from '@nestjs/testing';
import { PertemuansController } from './pertemuans.controller';
import { PertemuansService } from './pertemuans.service';

describe('PertemuansController', () => {
  let controller: PertemuansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PertemuansController],
      providers: [PertemuansService],
    }).compile();

    controller = module.get<PertemuansController>(PertemuansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
