import { Test, TestingModule } from '@nestjs/testing';
import { IntenshifService } from './intenshif.service';

describe('IntenshifService', () => {
  let service: IntenshifService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntenshifService],
    }).compile();

    service = module.get<IntenshifService>(IntenshifService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
