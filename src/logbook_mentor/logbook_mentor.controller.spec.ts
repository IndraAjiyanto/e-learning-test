import { Test, TestingModule } from '@nestjs/testing';
import { LogbookMentorController } from './logbook_mentor.controller';
import { LogbookMentorService } from './logbook_mentor.service';

describe('LogbookMentorController', () => {
  let controller: LogbookMentorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogbookMentorController],
      providers: [LogbookMentorService],
    }).compile();

    controller = module.get<LogbookMentorController>(LogbookMentorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
