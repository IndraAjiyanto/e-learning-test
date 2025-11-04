import { Test, TestingModule } from '@nestjs/testing';
import { TentangController } from './tentang.controller';
import { TentangService } from './tentang.service';

describe('TentangController', () => {
  let controller: TentangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TentangController],
      providers: [TentangService],
    }).compile();

    controller = module.get<TentangController>(TentangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
