import { Test, TestingModule } from '@nestjs/testing';
import { MaterisService } from './materis.service';

describe('MaterisService', () => {
  let service: MaterisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterisService],
    }).compile();

    service = module.get<MaterisService>(MaterisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
