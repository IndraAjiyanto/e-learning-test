import { Test, TestingModule } from '@nestjs/testing';
import { KomentarController } from './komentar.controller';
import { KomentarService } from './komentar.service';

describe('KomentarController', () => {
  let controller: KomentarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KomentarController],
      providers: [KomentarService],
    }).compile();

    controller = module.get<KomentarController>(KomentarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
