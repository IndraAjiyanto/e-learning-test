import { Test, TestingModule } from '@nestjs/testing';
import { TeknologiService } from './teknologi.service';

describe('TeknologiService', () => {
  let service: TeknologiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeknologiService],
    }).compile();

    service = module.get<TeknologiService>(TeknologiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
