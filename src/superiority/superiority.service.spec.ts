import { Test, TestingModule } from '@nestjs/testing';
import { SuperiorityService } from './superiority.service';

describe('SuperiorityService', () => {
  let service: SuperiorityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperiorityService],
    }).compile();

    service = module.get<SuperiorityService>(SuperiorityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
