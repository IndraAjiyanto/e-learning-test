import { Test, TestingModule } from '@nestjs/testing';
import { JawabanUsersController } from './jawaban_users.controller';
import { JawabanUsersService } from './jawaban_users.service';

describe('JawabanUsersController', () => {
  let controller: JawabanUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JawabanUsersController],
      providers: [JawabanUsersService],
    }).compile();

    controller = module.get<JawabanUsersController>(JawabanUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
