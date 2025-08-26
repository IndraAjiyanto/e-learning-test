import { Test, TestingModule } from '@nestjs/testing';
import { JawabanTugassService } from './jawaban_tugass.service';

describe('JawabanTugassService', () => {
  let service: JawabanTugassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JawabanTugassService],
    }).compile();

    service = module.get<JawabanTugassService>(JawabanTugassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
