import { Test, TestingModule } from '@nestjs/testing';
import { TeamLeadService } from './team_lead.service';

describe('TeamLeadService', () => {
  let service: TeamLeadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamLeadService],
    }).compile();

    service = module.get<TeamLeadService>(TeamLeadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
