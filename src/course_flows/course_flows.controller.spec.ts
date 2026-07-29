import { Test, TestingModule } from '@nestjs/testing';
import { CourseFlowsController } from './course_flows.controller';
import { CourseFlowsService } from './course_flows.service';

describe('CourseFlowsController', () => {
  let controller: CourseFlowsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseFlowsController],
      providers: [CourseFlowsService],
    }).compile();

    controller = module.get<CourseFlowsController>(CourseFlowsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
