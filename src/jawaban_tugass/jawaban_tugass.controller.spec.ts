import { Test, TestingModule } from '@nestjs/testing';
import { JawabanTugassController } from './jawaban_tugass.controller';
import { JawabanTugassService } from './jawaban_tugass.service';

describe('JawabanTugassController', () => {
  let controller: JawabanTugassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JawabanTugassController],
      providers: [JawabanTugassService],
    }).compile();

    controller = module.get<JawabanTugassController>(JawabanTugassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
