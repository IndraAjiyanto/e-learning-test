import { Test, TestingModule } from '@nestjs/testing';
import { MentorLogbookService } from './mentor_logbook.service';

describe('MentorLogbookService', () => {
  let service: MentorLogbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorLogbookService],
    }).compile();

    service = module.get<MentorLogbookService>(MentorLogbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
