import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from 'src/entities/course.entity';
import { PortfolioGuide } from 'src/entities/portfolio-guide.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Payment } from 'src/entities/payment.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Mentors } from 'src/entities/mentor.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { Technology } from 'src/entities/technology.entity';
import { Mentorings } from 'src/entities/mentoring.entity';
import { Registration } from 'src/entities/registration.entity';
import { CourseQuestions } from 'src/entities/course_question.entity';
import { ProgramBenefits } from 'src/entities/course_benefit.entity';
import { Participants } from 'src/entities/participants.entity';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Installment } from 'src/entities/installment.entity';
import { Session } from 'src/entities/session.entity';
import { Portofolios } from 'src/entities/portofolios.entity';

describe('CoursesService', () => {
  let service: CoursesService;
  let userCourseRepo: Record<string, jest.Mock>;
  let paymentRepo: Record<string, jest.Mock>;
  let registrationRepo: Record<string, jest.Mock>;

  const createMockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  });

  beforeEach(async () => {
    userCourseRepo = createMockRepo();
    paymentRepo = createMockRepo();
    registrationRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(PortfolioGuide),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(User), useValue: createMockRepo() },
        { provide: getRepositoryToken(Category), useValue: createMockRepo() },
        { provide: getRepositoryToken(CourseType), useValue: createMockRepo() },
        { provide: getRepositoryToken(Weeks), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(WeekProgress),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(Quiz), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(SessionProgress),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(UserCourse), useValue: userCourseRepo },
        { provide: getRepositoryToken(Mentors), useValue: createMockRepo() },
        { provide: getRepositoryToken(Logbook), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(MentorLogbook),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(Technology), useValue: createMockRepo() },
        { provide: getRepositoryToken(Mentorings), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(Registration),
          useValue: registrationRepo,
        },
        {
          provide: getRepositoryToken(CourseQuestions),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(ProgramBenefits),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(Participants),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(CourseFlow), useValue: createMockRepo() },
        { provide: getRepositoryToken(Alumni), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(Installment),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(Session), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(Portofolios),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeCourseUser', () => {
    const userId = 'user-123';
    const courseId = 'course-456';
    const mockUserCourse = {
      id: 'uc-1',
      user: { id: userId },
      course: { id: courseId },
    };

    it('should throw NotFoundException if user is not enrolled in course', async () => {
      userCourseRepo.findOne.mockResolvedValue(null);

      await expect(service.removeCourseUser(userId, courseId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userCourseRepo.remove).not.toHaveBeenCalled();
    });

    it('should remove user from course even if user has payment records', async () => {
      userCourseRepo.findOne.mockResolvedValue(mockUserCourse);
      paymentRepo.findOne.mockResolvedValue({ id: 'pay-1', file: 'bukti.jpg' });
      registrationRepo.findOne.mockResolvedValue(null);
      userCourseRepo.remove.mockResolvedValue(mockUserCourse);

      const result = await service.removeCourseUser(userId, courseId);

      expect(result).toEqual(mockUserCourse);
      expect(userCourseRepo.remove).toHaveBeenCalledWith(mockUserCourse);
      expect(paymentRepo.remove).not.toHaveBeenCalled();
    });

    it('should remove user from course even if user has registration records', async () => {
      userCourseRepo.findOne.mockResolvedValue(mockUserCourse);
      paymentRepo.findOne.mockResolvedValue(null);
      registrationRepo.findOne.mockResolvedValue({
        id: 'reg-1',
        file: 'reg-bukti.jpg',
      });
      userCourseRepo.remove.mockResolvedValue(mockUserCourse);

      const result = await service.removeCourseUser(userId, courseId);

      expect(result).toEqual(mockUserCourse);
      expect(userCourseRepo.remove).toHaveBeenCalledWith(mockUserCourse);
      expect(registrationRepo.remove).not.toHaveBeenCalled();
    });
  });
});
