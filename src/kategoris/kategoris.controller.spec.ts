import { Test, TestingModule } from '@nestjs/testing';
import { KategorisController } from './kategoris.controller';
import { KategorisService } from './kategoris.service';

describe('KategorisController', () => {
  let controller: KategorisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategorisController],
      providers: [KategorisService],
    }).compile();

    controller = module.get<KategorisController>(KategorisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
