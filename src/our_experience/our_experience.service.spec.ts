import { Test, TestingModule } from '@nestjs/testing';
import { OurExperienceService } from './our_experience.service';

describe('OurExperienceService', () => {
  let service: OurExperienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OurExperienceService],
    }).compile();

    service = module.get<OurExperienceService>(OurExperienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
