import { Test, TestingModule } from '@nestjs/testing';
import { MentorLogbookController } from './mentor_logbook.controller';
import { MentorLogbookService } from './mentor_logbook.service';

describe('MentorLogbookController', () => {
  let controller: MentorLogbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorLogbookController],
      providers: [MentorLogbookService],
    }).compile();

    controller = module.get<MentorLogbookController>(MentorLogbookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
