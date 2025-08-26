import { Test, TestingModule } from '@nestjs/testing';
import { JawabansService } from './jawabans.service';

describe('JawabansService', () => {
  let service: JawabansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JawabansService],
    }).compile();

    service = module.get<JawabansService>(JawabansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
