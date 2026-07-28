import { Test, TestingModule } from '@nestjs/testing';
import { AnswerTasksController } from './assignment_answers.controller';
import { AnswerTasksService } from './assignment_answers.service';

describe('JawabanTugassController', () => {
  let controller: AnswerTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerTasksController],
      providers: [AnswerTasksService],
    }).compile();

    controller = module.get<AnswerTasksController>(AnswerTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
