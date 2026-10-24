import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { UsersService } from 'src/users/users.service';
import { FinalAssignmentService } from 'src/final_assignment/final_assignment.service';
import { PaymentSettingsService } from 'src/payment-settings/payment-settings.service';
import { PortfoliosService } from 'src/portfolios/portfolios.service';
import { UploadService } from 'src/common/upload/upload.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: {
    findOne: jest.Mock;
    findCategory: jest.Mock;
    findCourseTypes: jest.Mock;
    findTechnologies: jest.Mock;
    findMentoring: jest.Mock;
  };

  beforeEach(async () => {
    coursesService = {
      findOne: jest.fn(),
      findCategory: jest.fn(),
      findCourseTypes: jest.fn(),
      findTechnologies: jest.fn(),
      findMentoring: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: coursesService },
        { provide: UsersService, useValue: {} },
        { provide: FinalAssignmentService, useValue: {} },
        { provide: PaymentSettingsService, useValue: {} },
        { provide: PortfoliosService, useValue: {} },
        { provide: UploadService, useValue: {} },
        Reflector,
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('formEdit', () => {
    it('should render admin/course/edit even when course already has enrolled participants', async () => {
      const mockCourse = {
        id: 'course-1',
        name: 'Bootcamp Fullstack',
        userCourses: [{ id: 'uc-1' }, { id: 'uc-2' }],
      };
      const mockCategories = [{ id: 'cat-1', name: 'Web' }];
      const mockTypes = [{ id: 'type-1', nameClassesType: 'Online' }];
      const mockTech = [{ id: 'tech-1', name: 'Node.js' }];
      const mockMentorings = [{ id: 'ment-1' }];

      coursesService.findOne.mockResolvedValue(mockCourse);
      coursesService.findCategory.mockResolvedValue(mockCategories);
      coursesService.findCourseTypes.mockResolvedValue(mockTypes);
      coursesService.findTechnologies.mockResolvedValue(mockTech);
      coursesService.findMentoring.mockResolvedValue(mockMentorings);

      const mockRes = {
        render: jest.fn(),
        redirect: jest.fn(),
      } as any;

      const mockReq = {
        user: { id: 'admin-1', role: 'super_admin' },
        flash: jest.fn(),
      } as any;

      await controller.formEdit(mockRes, 'course-1', 'cat-1', mockReq);

      expect(coursesService.findOne).toHaveBeenCalledWith('course-1');
      expect(mockRes.render).toHaveBeenCalledWith('admin/course/edit', {
        user: mockReq.user,
        course: mockCourse,
        category: mockCategories,
        courseType: mockTypes,
        technologies: mockTech,
        mentorings: mockMentorings,
        categoryId: 'cat-1',
      });
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to /program if course is not found', async () => {
      coursesService.findOne.mockResolvedValue(null);

      const mockRes = {
        render: jest.fn(),
        redirect: jest.fn(),
      } as any;

      const mockReq = {
        user: { id: 'admin-1' },
        flash: jest.fn(),
      } as any;

      await controller.formEdit(mockRes, 'invalid-id', '', mockReq);

      expect(mockReq.flash).toHaveBeenCalledWith('error', 'Program not found');
      expect(mockRes.redirect).toHaveBeenCalledWith('/program');
      expect(mockRes.render).not.toHaveBeenCalled();
    });
  });
});
