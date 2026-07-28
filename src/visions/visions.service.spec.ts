import { Test, TestingModule } from '@nestjs/testing';
import { VisionsService } from './visions.service';

describe('VisionService', () => {
  let service: VisionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisionsService],
    }).compile();

    service = module.get<VisionsService>(VisionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
