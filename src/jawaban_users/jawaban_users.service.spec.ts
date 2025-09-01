import { Test, TestingModule } from '@nestjs/testing';
import { JawabanUsersService } from './jawaban_users.service';

describe('JawabanUsersService', () => {
  let service: JawabanUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JawabanUsersService],
    }).compile();

    service = module.get<JawabanUsersService>(JawabanUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
