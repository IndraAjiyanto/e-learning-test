import { Test, TestingModule } from '@nestjs/testing';
import { JawabansController } from './jawabans.controller';
import { JawabansService } from './jawabans.service';

describe('JawabansController', () => {
  let controller: JawabansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JawabansController],
      providers: [JawabansService],
    }).compile();

    controller = module.get<JawabansController>(JawabansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
