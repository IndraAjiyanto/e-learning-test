import { Test, TestingModule } from '@nestjs/testing';
import { CicilanController } from './cicilan.controller';
import { CicilanService } from './cicilan.service';

describe('CicilanController', () => {
  let controller: CicilanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CicilanController],
      providers: [CicilanService],
    }).compile();

    controller = module.get<CicilanController>(CicilanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
