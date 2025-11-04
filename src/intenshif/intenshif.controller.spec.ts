import { Test, TestingModule } from '@nestjs/testing';
import { IntenshifController } from './intenshif.controller';
import { IntenshifService } from './intenshif.service';

describe('IntenshifController', () => {
  let controller: IntenshifController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntenshifController],
      providers: [IntenshifService],
    }).compile();

    controller = module.get<IntenshifController>(IntenshifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
