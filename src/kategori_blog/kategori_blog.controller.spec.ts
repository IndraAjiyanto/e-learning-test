import { Test, TestingModule } from '@nestjs/testing';
import { KategoriBlogController } from './kategori_blog.controller';
import { KategoriBlogService } from './kategori_blog.service';

describe('KategoriBlogController', () => {
  let controller: KategoriBlogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategoriBlogController],
      providers: [KategoriBlogService],
    }).compile();

    controller = module.get<KategoriBlogController>(KategoriBlogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
