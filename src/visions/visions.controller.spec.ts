import { Test, TestingModule } from '@nestjs/testing';
import { VisionsController } from './visions.controller';
import { VisionsService } from './visions.service';

describe('VisionsController', () => {
  let controller: VisionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisionsController],
      providers: [VisionsService],
    }).compile();

    controller = module.get<VisionsController>(VisionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
