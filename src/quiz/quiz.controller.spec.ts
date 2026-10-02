import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { UsersService } from 'src/users/users.service';

describe('QuizController', () => {
  let controller: QuizController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [QuizService, UsersService],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
