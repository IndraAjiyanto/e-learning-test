import { Test, TestingModule } from '@nestjs/testing';
import { MisiController } from './misi.controller';
import { MisiService } from './misi.service';

describe('MisiController', () => {
  let controller: MisiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MisiController],
      providers: [MisiService],
    }).compile();

    controller = module.get<MisiController>(MisiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
