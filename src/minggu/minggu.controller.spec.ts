import { Test, TestingModule } from '@nestjs/testing';
import { MingguController } from './minggu.controller';
import { MingguService } from './minggu.service';

describe('MingguController', () => {
  let controller: MingguController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MingguController],
      providers: [MingguService],
    }).compile();

    controller = module.get<MingguController>(MingguController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
