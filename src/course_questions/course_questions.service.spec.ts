import { Test, TestingModule } from '@nestjs/testing';
import { CourseQuestionsService } from './course_questions.service';

describe('CourseQuestionsService', () => {
  let service: CourseQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseQuestionsService],
    }).compile();

    service = module.get<CourseQuestionsService>(CourseQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
