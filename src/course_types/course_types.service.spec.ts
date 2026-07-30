import { Test, TestingModule } from '@nestjs/testing';
import { CourseTypesService } from './course_types.service';

describe('CourseTypesService', () => {
  let service: CourseTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseTypesService],
    }).compile();

    service = module.get<CourseTypesService>(CourseTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
