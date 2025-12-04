import { Test, TestingModule } from '@nestjs/testing';
import { OurExperienceController } from './our_experience.controller';
import { OurExperienceService } from './our_experience.service';

describe('OurExperienceController', () => {
  let controller: OurExperienceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OurExperienceController],
      providers: [OurExperienceService],
    }).compile();

    controller = module.get<OurExperienceController>(OurExperienceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
