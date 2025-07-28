import { Test, TestingModule } from '@nestjs/testing';
import { AbsensController } from './absens.controller';
import { AbsensService } from './absens.service';

describe('AbsensController', () => {
  let controller: AbsensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbsensController],
      providers: [AbsensService],
    }).compile();

    controller = module.get<AbsensController>(AbsensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
