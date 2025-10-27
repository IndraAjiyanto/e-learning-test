import { Test, TestingModule } from '@nestjs/testing';
import { KategoriBlogService } from './kategori_blog.service';

describe('KategoriBlogService', () => {
  let service: KategoriBlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KategoriBlogService],
    }).compile();

    service = module.get<KategoriBlogService>(KategoriBlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
