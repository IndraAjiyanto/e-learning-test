import { Test, TestingModule } from '@nestjs/testing';
import { ComentService } from './coment.service';

describe('ComentService', () => {
  let service: ComentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComentService],
    }).compile();

    service = module.get<ComentService>(ComentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
