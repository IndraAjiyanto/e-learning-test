import { Test, TestingModule } from '@nestjs/testing';
import { TugassController } from './tugass.controller';
import { TugassService } from './tugass.service';

describe('TugassController', () => {
  let controller: TugassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TugassController],
      providers: [TugassService],
    }).compile();

    controller = module.get<TugassController>(TugassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
