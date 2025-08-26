import { Test, TestingModule } from '@nestjs/testing';
import { PertanyaansController } from './pertanyaans.controller';
import { PertanyaansService } from './pertanyaans.service';

describe('PertanyaansController', () => {
  let controller: PertanyaansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PertanyaansController],
      providers: [PertanyaansService],
    }).compile();

    controller = module.get<PertanyaansController>(PertanyaansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
