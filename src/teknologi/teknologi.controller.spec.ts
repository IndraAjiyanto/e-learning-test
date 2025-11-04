import { Test, TestingModule } from '@nestjs/testing';
import { TeknologiController } from './teknologi.controller';
import { TeknologiService } from './teknologi.service';

describe('TeknologiController', () => {
  let controller: TeknologiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeknologiController],
      providers: [TeknologiService],
    }).compile();

    controller = module.get<TeknologiController>(TeknologiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
