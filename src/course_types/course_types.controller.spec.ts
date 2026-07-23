import { Test, TestingModule } from '@nestjs/testing';
import { CourseTypesController } from './course_types.controller';
import { CourseTypesService } from './course_types.service';

describe('JenisKelasController', () => {
  let controller: CourseTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseTypesController],
      providers: [CourseTypesService],
    }).compile();

    controller = module.get<CourseTypesController>(CourseTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
