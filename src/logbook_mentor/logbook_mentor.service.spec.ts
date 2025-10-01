import { Test, TestingModule } from '@nestjs/testing';
import { LogbookMentorService } from './logbook_mentor.service';

describe('LogbookMentorService', () => {
  let service: LogbookMentorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogbookMentorService],
    }).compile();

    service = module.get<LogbookMentorService>(LogbookMentorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
