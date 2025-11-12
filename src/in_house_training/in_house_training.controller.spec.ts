import { Test, TestingModule } from '@nestjs/testing';
import { InHouseTrainingController } from './in_house_training.controller';
import { InHouseTrainingService } from './in_house_training.service';

describe('InHouseTrainingController', () => {
  let controller: InHouseTrainingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InHouseTrainingController],
      providers: [InHouseTrainingService],
    }).compile();

    controller = module.get<InHouseTrainingController>(
      InHouseTrainingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
