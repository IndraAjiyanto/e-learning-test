import { Test, TestingModule } from '@nestjs/testing';
import { BiodatasController } from './biodatas.controller';
import { BiodatasService } from './biodatas.service';

describe('BiodatasController', () => {
  let controller: BiodatasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiodatasController],
      providers: [BiodatasService],
    }).compile();

    controller = module.get<BiodatasController>(BiodatasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
