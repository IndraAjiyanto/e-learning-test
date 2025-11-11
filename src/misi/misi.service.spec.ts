import { Test, TestingModule } from '@nestjs/testing';
import { MisiService } from './misi.service';

describe('MisiService', () => {
  let service: MisiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MisiService],
    }).compile();

    service = module.get<MisiService>(MisiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
