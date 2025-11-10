import { Test, TestingModule } from '@nestjs/testing';
import { ParagrafController } from './paragraf.controller';
import { ParagrafService } from './paragraf.service';

describe('ParagrafController', () => {
  let controller: ParagrafController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParagrafController],
      providers: [ParagrafService],
    }).compile();

    controller = module.get<ParagrafController>(ParagrafController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
