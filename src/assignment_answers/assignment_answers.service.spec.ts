import { Test, TestingModule } from '@nestjs/testing';
import { AnswerTasksService } from './assignment_answers.service';

describe('AnswerTasksService', () => {
  let service: AnswerTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswerTasksService],
    }).compile();

    service = module.get<AnswerTasksService>(AnswerTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
