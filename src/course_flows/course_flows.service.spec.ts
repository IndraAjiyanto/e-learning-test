import { Test, TestingModule } from '@nestjs/testing';
import { CourseFlowsService } from './course_flows.service';

describe('CourseFlowsService', () => {
  let service: CourseFlowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseFlowsService],
    }).compile();

    service = module.get<CourseFlowsService>(CourseFlowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
