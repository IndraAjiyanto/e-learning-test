import { Test, TestingModule } from '@nestjs/testing';
import { KelassController } from './kelass.controller';
import { KelassService } from './kelass.service';

describe('KelassController', () => {
  let controller: KelassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KelassController],
      providers: [KelassService],
    }).compile();

    controller = module.get<KelassController>(KelassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
