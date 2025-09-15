import { Test, TestingModule } from '@nestjs/testing';
import { MingguService } from './minggu.service';

describe('MingguService', () => {
  let service: MingguService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MingguService],
    }).compile();

    service = module.get<MingguService>(MingguService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
