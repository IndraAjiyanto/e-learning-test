import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { UsersService } from 'src/users/users.service';
import { PaymentSettingsService } from 'src/payment-settings/payment-settings.service';
import { PortfoliosService } from 'src/portfolios/portfolios.service';
import { FinalAssignmentService } from 'src/final_assignment/final_assignment.service';
import { UploadService } from 'src/common/upload/upload.service';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: {
    findOne: jest.Mock;
    findCategory: jest.Mock;
    findCourseTypes: jest.Mock;
    findTechnologies: jest.Mock;
    findMentoring: jest.Mock;
    checkLearningStructureLock: jest.Mock;
    findMyCourse: jest.Mock;
    findSyllabusForUser: jest.Mock;
    findWeeks: jest.Mock;
    getUserCourseRelation: jest.Mock;
    findOnePortfolio: jest.Mock;
  };

  beforeEach(async () => {
    coursesService = {
      findOne: jest.fn(),
      findCategory: jest.fn(),
      findCourseTypes: jest.fn(),
      findTechnologies: jest.fn(),
      findMentoring: jest.fn(),
      checkLearningStructureLock: jest.fn(),
      findMyCourse: jest.fn(),
      findSyllabusForUser: jest.fn(),
      findWeeks: jest.fn(),
      getUserCourseRelation: jest.fn(),
      findOnePortfolio: jest.fn(),
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
      coursesService.checkLearningStructureLock.mockResolvedValue({
        isLocked: false,
        hasWeeks: false,
        hasPortfolioGuide: false,
        hasFinalAssignment: false,
        hasSyllabus: false,
      });

      const renderSpy = jest.fn();
      const redirectSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        redirect: redirectSpy,
      } as unknown as Response;

      const mockUser = { id: 'admin-1', role: 'super_admin' };
      const flashSpy = jest.fn();
      const mockReq = {
        user: mockUser,
        flash: flashSpy,
      } as unknown as Request;

      await controller.formEdit(mockRes, 'course-1', 'cat-1', mockReq);

      expect(coursesService.findOne).toHaveBeenCalledWith('course-1');
      expect(coursesService.checkLearningStructureLock).toHaveBeenCalledWith(
        'course-1',
      );
      expect(renderSpy).toHaveBeenCalledWith('admin/course/edit', {
        learningStructureLocked: false,
        learningStructureLockHint: undefined,
        user: mockUser,
        course: mockCourse,
        category: mockCategories,
        courseType: mockTypes,
        technologies: mockTech,
        mentorings: mockMentorings,
        categoryId: 'cat-1',
      });
      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it('should pass learningStructureLocked true and hint when locked', async () => {
      const mockCourse = {
        id: 'course-2',
        name: 'Bootcamp Android',
        programType: 'bootcamp',
      };
      coursesService.findOne.mockResolvedValue(mockCourse);
      coursesService.findCategory.mockResolvedValue([]);
      coursesService.findCourseTypes.mockResolvedValue([]);
      coursesService.findTechnologies.mockResolvedValue([]);
      coursesService.findMentoring.mockResolvedValue([]);
      coursesService.checkLearningStructureLock.mockResolvedValue({
        isLocked: true,
        reason:
          'Learning structure tidak dapat diubah karena program sudah memiliki week.',
        hint: 'Learning structure cannot be edited because this program already has week.',
        hasWeeks: true,
        hasPortfolioGuide: false,
        hasFinalAssignment: false,
        hasSyllabus: false,
      });

      const renderSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        redirect: jest.fn(),
      } as unknown as Response;
      const mockReq = {
        user: { id: 'admin-1', role: 'admin' },
        flash: jest.fn(),
      } as unknown as Request;

      await controller.formEdit(mockRes, 'course-2', '', mockReq);

      expect(renderSpy).toHaveBeenCalledWith(
        'admin/course/edit',
        expect.objectContaining({
          learningStructureLocked: true,
          learningStructureLockHint:
            'Learning structure cannot be edited because this program already has week.',
        }),
      );
    });

    it('should redirect to /program if course is not found', async () => {
      coursesService.findOne.mockResolvedValue(null);

      const renderSpy = jest.fn();
      const redirectSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        redirect: redirectSpy,
      } as unknown as Response;

      const flashSpy = jest.fn();
      const mockReq = {
        user: { id: 'admin-1' },
        flash: flashSpy,
      } as unknown as Request;

      await controller.formEdit(mockRes, 'invalid-id', '', mockReq);

      expect(flashSpy).toHaveBeenCalledWith('error', 'Program not found');
      expect(redirectSpy).toHaveBeenCalledWith('/program');
      expect(renderSpy).not.toHaveBeenCalled();
    });
  });

  describe('myCourseFragment', () => {
    it('should allow start learning for non_bootcamp when status is launch (published)', async () => {
      const mockCourse = {
        id: 'nb-1',
        name: 'Faster Class',
        programType: 'non_bootcamp',
        status: 'launch',
      };
      coursesService.findMyCourse.mockResolvedValue([mockCourse]);
      coursesService.findSyllabusForUser.mockResolvedValue([
        { id: 's-1', title: 'Modul 1', isUnlocked: true },
      ]);

      const renderSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        locals: { lang: 'id' },
      } as unknown as Response;
      const mockReq = {
        user: { id: 'user-1', role: 'user' },
      } as unknown as Request;

      await controller.myCourseFragment('user-1', mockRes, mockReq, 'nb-1');

      expect(renderSpy).toHaveBeenCalledWith(
        'partials/user/sidebar_user_profile/my_learning/start_learning/non_bootcamp',
        expect.objectContaining({
          course: mockCourse,
          isProgramNotStarted: false,
          isNonBootcamp: true,
        }),
      );
    });

    it('should allow start learning for non_bootcamp when status is learning (learning start)', async () => {
      const mockCourse = {
        id: 'nb-1',
        name: 'Faster Class',
        programType: 'non_bootcamp',
        status: 'learning',
      };
      coursesService.findMyCourse.mockResolvedValue([mockCourse]);
      coursesService.findSyllabusForUser.mockResolvedValue([]);

      const renderSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        locals: { lang: 'id' },
      } as unknown as Response;
      const mockReq = {
        user: { id: 'user-1', role: 'user' },
      } as unknown as Request;

      await controller.myCourseFragment('user-1', mockRes, mockReq, 'nb-1');

      expect(renderSpy).toHaveBeenCalledWith(
        'partials/user/sidebar_user_profile/my_learning/start_learning/non_bootcamp',
        expect.objectContaining({
          course: mockCourse,
          isProgramNotStarted: false,
          isNonBootcamp: true,
        }),
      );
    });

    it('should allow start learning for non_bootcamp when status is done (completed)', async () => {
      const mockCourse = {
        id: 'nb-1',
        name: 'Faster Class',
        programType: 'non_bootcamp',
        status: 'done',
      };
      coursesService.findMyCourse.mockResolvedValue([mockCourse]);
      coursesService.findSyllabusForUser.mockResolvedValue([]);

      const renderSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        locals: { lang: 'id' },
      } as unknown as Response;
      const mockReq = {
        user: { id: 'user-1', role: 'user' },
      } as unknown as Request;

      await controller.myCourseFragment('user-1', mockRes, mockReq, 'nb-1');

      expect(renderSpy).toHaveBeenCalledWith(
        'partials/user/sidebar_user_profile/my_learning/start_learning/non_bootcamp',
        expect.objectContaining({
          course: mockCourse,
          isProgramNotStarted: false,
          isNonBootcamp: true,
        }),
      );
    });

    it('should mark program not started for non_bootcamp when status is unlaunch', async () => {
      const mockCourse = {
        id: 'nb-1',
        name: 'Faster Class',
        programType: 'non_bootcamp',
        status: 'unlaunch',
      };
      coursesService.findMyCourse.mockResolvedValue([mockCourse]);
      coursesService.findSyllabusForUser.mockResolvedValue([]);

      const renderSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        locals: { lang: 'id' },
      } as unknown as Response;
      const mockReq = {
        user: { id: 'user-1', role: 'user' },
      } as unknown as Request;

      await controller.myCourseFragment('user-1', mockRes, mockReq, 'nb-1');

      expect(renderSpy).toHaveBeenCalledWith(
        'partials/user/sidebar_user_profile/my_learning/start_learning/non_bootcamp',
        expect.objectContaining({
          course: mockCourse,
          isProgramNotStarted: true,
          isNonBootcamp: true,
        }),
      );
    });

    it('should mark program not started for bootcamp when status is launch', async () => {
      const mockCourse = {
        id: 'bc-1',
        name: 'Fullstack Bootcamp',
        programType: 'bootcamp',
        status: 'launch',
      };
      coursesService.findMyCourse.mockResolvedValue([mockCourse]);
      coursesService.findWeeks.mockResolvedValue([]);
      coursesService.getUserCourseRelation.mockResolvedValue(null);
      coursesService.findOnePortfolio.mockResolvedValue(null);

      const renderSpy = jest.fn();
      const mockRes = {
        render: renderSpy,
        locals: { lang: 'id' },
      } as unknown as Response;
      const mockReq = {
        user: { id: 'user-1', role: 'user' },
      } as unknown as Request;

      await controller.myCourseFragment('user-1', mockRes, mockReq, 'bc-1');

      expect(renderSpy).toHaveBeenCalledWith(
        'partials/user/sidebar_user_profile/my_learning/start_learning/index',
        expect.objectContaining({
          course: mockCourse,
          isProgramNotStarted: true,
          isNonBootcamp: false,
        }),
      );
    });
  });
});
