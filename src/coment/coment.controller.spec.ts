import { Test, TestingModule } from '@nestjs/testing';
import { ComentController } from './coment.controller';
import { ComentService } from './coment.service';

describe('ComentController', () => {
  let controller: ComentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentController],
      providers: [ComentService],
    }).compile();

    controller = module.get<ComentController>(ComentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
