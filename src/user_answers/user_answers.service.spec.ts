import { Test, TestingModule } from '@nestjs/testing';
import { UserAnswersService } from './user_answers.service';

describe('JawabanUsersService', () => {
  let service: UserAnswersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAnswersService],
    }).compile();

    service = module.get<UserAnswersService>(UserAnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
