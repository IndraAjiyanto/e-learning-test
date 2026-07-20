import { Test, TestingModule } from '@nestjs/testing';
import { UserAnswersController } from './user_answers.controller';
import { UserAnswersService } from './user_answers.service';

describe('JawabanUsersController', () => {
  let controller: UserAnswersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAnswersController],
      providers: [UserAnswersService],
    }).compile();

    controller = module.get<UserAnswersController>(UserAnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
