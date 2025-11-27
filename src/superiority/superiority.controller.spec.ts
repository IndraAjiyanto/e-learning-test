import { Test, TestingModule } from '@nestjs/testing';
import { SuperiorityController } from './superiority.controller';
import { SuperiorityService } from './superiority.service';

describe('SuperiorityController', () => {
  let controller: SuperiorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperiorityController],
      providers: [SuperiorityService],
    }).compile();

    controller = module.get<SuperiorityController>(SuperiorityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
