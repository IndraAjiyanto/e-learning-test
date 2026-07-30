import { Test, TestingModule } from '@nestjs/testing';
import { WeeksController } from './weeks.controller';
import { WeeksService } from './weeks.service';

describe('WeeksController', () => {
  let controller: WeeksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeksController],
      providers: [WeeksService],
    }).compile();

    controller = module.get<WeeksController>(WeeksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
