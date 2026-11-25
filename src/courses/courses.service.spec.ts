import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
import { Syllabus } from 'src/entities/syllabus.entity';
import { FinalAssignment } from 'src/entities/final_assignment.entity';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepo: Record<string, jest.Mock>;
  let weeksRepo: Record<string, jest.Mock>;
  let portfolioGuideRepo: Record<string, jest.Mock>;
  let finalAssignmentRepo: Record<string, jest.Mock>;
  let syllabusRepo: Record<string, jest.Mock>;
  let userCourseRepo: Record<string, jest.Mock>;
  let paymentRepo: Record<string, jest.Mock>;
  let registrationRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;
  let mentoringRepo: Record<string, jest.Mock>;

  const createMockRepo = () => ({
    find: jest.fn(),
    findBy: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  });

  beforeEach(async () => {
    courseRepo = createMockRepo();
    weeksRepo = createMockRepo();
    portfolioGuideRepo = createMockRepo();
    finalAssignmentRepo = createMockRepo();
    syllabusRepo = createMockRepo();
    userCourseRepo = createMockRepo();
    paymentRepo = createMockRepo();
    registrationRepo = createMockRepo();
    userRepo = createMockRepo();
    mentoringRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        {
          provide: getRepositoryToken(PortfolioGuide),
          useValue: portfolioGuideRepo,
        },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Category), useValue: createMockRepo() },
        { provide: getRepositoryToken(CourseType), useValue: createMockRepo() },
        { provide: getRepositoryToken(Weeks), useValue: weeksRepo },
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
        { provide: getRepositoryToken(Mentorings), useValue: mentoringRepo },
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
        {
          provide: getRepositoryToken(Syllabus),
          useValue: syllabusRepo,
        },
        {
          provide: getRepositoryToken(FinalAssignment),
          useValue: finalAssignmentRepo,
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

  describe('checkLearningStructureLock', () => {
    it('should throw NotFoundException if course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);
      await expect(
        service.checkLearningStructureLock('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('bootcamp: locked if has weeks', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'bootcamp',
      });
      weeksRepo.count.mockResolvedValue(1);
      portfolioGuideRepo.count.mockResolvedValue(0);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(0);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(true);
      expect(res.hasWeeks).toBe(true);
      expect(res.reason).toContain('week');
    });

    it('bootcamp: locked if has portfolio guide', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'bootcamp',
      });
      weeksRepo.count.mockResolvedValue(0);
      portfolioGuideRepo.count.mockResolvedValue(1);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(0);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(true);
      expect(res.hasPortfolioGuide).toBe(true);
      expect(res.reason).toContain('portfolio guide');
    });

    it('bootcamp: locked if has final assignment', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'bootcamp',
      });
      weeksRepo.count.mockResolvedValue(0);
      portfolioGuideRepo.count.mockResolvedValue(0);
      finalAssignmentRepo.count.mockResolvedValue(1);
      syllabusRepo.count.mockResolvedValue(0);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(true);
      expect(res.hasFinalAssignment).toBe(true);
      expect(res.reason).toContain('final assignment');
    });

    it('bootcamp: unlocked if has none of week, portfolio guide, final assignment', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'bootcamp',
      });
      weeksRepo.count.mockResolvedValue(0);
      portfolioGuideRepo.count.mockResolvedValue(0);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(0);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(false);
    });

    it('non_bootcamp: locked if has syllabus', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'non_bootcamp',
      });
      weeksRepo.count.mockResolvedValue(0);
      portfolioGuideRepo.count.mockResolvedValue(0);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(2);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(true);
      expect(res.hasSyllabus).toBe(true);
      expect(res.reason).toContain('silabus');
    });

    it('non_bootcamp: locked if has portfolio guide', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'non_bootcamp',
      });
      weeksRepo.count.mockResolvedValue(0);
      portfolioGuideRepo.count.mockResolvedValue(1);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(0);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(true);
      expect(res.hasPortfolioGuide).toBe(true);
      expect(res.reason).toContain('portfolio guide');
    });

    it('non_bootcamp: unlocked if has neither syllabus nor portfolio guide', async () => {
      courseRepo.findOne.mockResolvedValue({
        id: 'c1',
        programType: 'non_bootcamp',
      });
      weeksRepo.count.mockResolvedValue(0);
      portfolioGuideRepo.count.mockResolvedValue(0);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(0);

      const res = await service.checkLearningStructureLock('c1');
      expect(res.isLocked).toBe(false);
    });
  });

  describe('update learning structure lock guard', () => {
    it('throws BadRequestException if changing bootcamp to non_bootcamp while locked', async () => {
      const existingCourse = { id: 'c1', programType: 'bootcamp' };
      courseRepo.findOne.mockResolvedValue(existingCourse);
      weeksRepo.count.mockResolvedValue(1);
      portfolioGuideRepo.count.mockResolvedValue(0);
      finalAssignmentRepo.count.mockResolvedValue(0);
      syllabusRepo.count.mockResolvedValue(0);

      await expect(
        service.update('c1', { programType: 'non_bootcamp' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows update if programType remains unchanged even while locked', async () => {
      const existingCourse = { id: 'c1', programType: 'bootcamp' };
      courseRepo.findOne.mockResolvedValue(existingCourse);
      courseRepo.save.mockResolvedValue(existingCourse);

      const res = await service.update('c1', { programType: 'bootcamp' });
      expect(res).toBeDefined();
    });
  });

  describe('findSyllabusForUser sequential unlocking', () => {
    it('locks subsequent syllabus if previous syllabus has no quiz or is not passed, preventing jumping', async () => {
      const mockSyllabuses = [
        {
          id: 's1',
          title: 'Silabus 1',
          syllabusNumber: 1,
          description: 'Desc 1',
          quiz: [{ id: 'q1', minScore: 80 }],
        },
        {
          id: 's2',
          title: 'Silabus 2',
          syllabusNumber: 2,
          description: 'Desc 2',
          quiz: [], // Tanpa kuis
        },
        {
          id: 's3',
          title: 'Silabus 3',
          syllabusNumber: 3,
          description: 'Desc 3',
          quiz: [{ id: 'q3', minScore: 80 }],
        },
      ];

      const syllabusRepoMock = {
        find: jest.fn().mockResolvedValue(mockSyllabuses),
      };

      const scoreQueryBuilderMock = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          // User lulus kuis s1
          { quiz: { id: 'q1' }, score: 85 },
        ]),
      };

      const scoreRepoMock = {
        createQueryBuilder: jest.fn().mockReturnValue(scoreQueryBuilderMock),
      };

      (courseRepo as any).manager = {
        getRepository: jest.fn((entity) => {
          if (entity === Syllabus) return syllabusRepoMock;
          return scoreRepoMock;
        }),
      };

      const result = await service.findSyllabusForUser('c1', 'u1');

      // Silabus 1: Terbuka dan Lulus
      expect(result[0].isUnlocked).toBe(true);
      expect(result[0].isPassed).toBe(true);

      // Silabus 2: Terbuka (karena s1 lulus), tapi isPassed = false (tidak ada kuis)
      expect(result[1].isUnlocked).toBe(true);
      expect(result[1].isPassed).toBe(false);

      // Silabus 3: Tetap TERKUNCI karena s2 belum lulus kuis (TIDAK LOMPAT!)
      expect(result[2].isUnlocked).toBe(false);
      expect(result[2].isPassed).toBe(false);
    });

    it('keeps all subsequent syllabuses locked if first syllabus quiz is failed', async () => {
      const mockSyllabuses = [
        {
          id: 's1',
          title: 'Silabus 1',
          syllabusNumber: 1,
          description: 'Desc 1',
          quiz: [{ id: 'q1', minScore: 80 }],
        },
        {
          id: 's2',
          title: 'Silabus 2',
          syllabusNumber: 2,
          description: 'Desc 2',
          quiz: [],
        },
        {
          id: 's3',
          title: 'Silabus 3',
          syllabusNumber: 3,
          description: 'Desc 3',
          quiz: [{ id: 'q3', minScore: 80 }],
        },
      ];

      const syllabusRepoMock = {
        find: jest.fn().mockResolvedValue(mockSyllabuses),
      };

      const scoreQueryBuilderMock = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          // Skor di bawah KKM 80
          { quiz: { id: 'q1' }, score: 50 },
        ]),
      };

      const scoreRepoMock = {
        createQueryBuilder: jest.fn().mockReturnValue(scoreQueryBuilderMock),
      };

      (courseRepo as any).manager = {
        getRepository: jest.fn((entity) => {
          if (entity === Syllabus) return syllabusRepoMock;
          return scoreRepoMock;
        }),
      };

      const result = await service.findSyllabusForUser('c1', 'u1');

      // Silabus 1 terbuka, belum lulus
      expect(result[0].isUnlocked).toBe(true);
      expect(result[0].isPassed).toBe(false);

      // Silabus 2 terkunci
      expect(result[1].isUnlocked).toBe(false);

      // Silabus 3 terkunci
      expect(result[2].isUnlocked).toBe(false);
    });
  });

  describe('Multi-mentor (syncMentorings & createMentoring)', () => {
    it('should assign multiple mentors to a course', async () => {
      const mockCourse = {
        id: 'c1',
        mentorings: [],
      };
      courseRepo.findOne.mockResolvedValue(mockCourse);

      const mockUsers = [
        { id: 'u1', username: 'mentor1', role: 'admin' },
        { id: 'u2', username: 'mentor2', role: 'admin' },
      ];
      userRepo.find.mockResolvedValue(mockUsers);
      mentoringRepo.create.mockImplementation((dto) => dto);
      mentoringRepo.save.mockResolvedValue([]);
      mentoringRepo.find.mockResolvedValue([
        { id: 'm1', course: mockCourse, user: mockUsers[0] },
        { id: 'm2', course: mockCourse, user: mockUsers[1] },
      ]);

      const result = await service.syncMentorings(['u1', 'u2'], 'c1');

      expect(courseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'c1' },
        relations: ['mentorings', 'mentorings.user'],
      });
      expect(userRepo.find).toHaveBeenCalled();
      expect(mentoringRepo.create).toHaveBeenCalledTimes(2);
      expect(mentoringRepo.save).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should remove unassigned mentors and add new ones when synced', async () => {
      const existingMentoring1 = {
        id: 'm1',
        user: { id: 'u1', role: 'admin' },
      };
      const existingMentoring2 = {
        id: 'm2',
        user: { id: 'u2', role: 'admin' },
      };
      const mockCourse = {
        id: 'c1',
        mentorings: [existingMentoring1, existingMentoring2],
      };
      courseRepo.findOne.mockResolvedValue(mockCourse);

      // We want to keep u2 and add u3, removing u1
      const mockUsers = [{ id: 'u3', username: 'mentor3', role: 'admin' }];
      userRepo.find.mockResolvedValue(mockUsers);
      mentoringRepo.remove.mockResolvedValue([]);
      mentoringRepo.create.mockImplementation((dto) => dto);
      mentoringRepo.save.mockResolvedValue([]);
      mentoringRepo.find.mockResolvedValue([
        existingMentoring2,
        { id: 'm3', course: mockCourse, user: mockUsers[0] },
      ]);

      const result = await service.syncMentorings(['u2', 'u3'], 'c1');

      expect(mentoringRepo.remove).toHaveBeenCalledWith([existingMentoring1]);
      expect(mentoringRepo.create).toHaveBeenCalledWith({
        course: mockCourse,
        user: mockUsers[0],
      });
      expect(result).toHaveLength(2);
    });

    it('createMentoring should call syncMentorings when an array of IDs is provided', async () => {
      const spy = jest.spyOn(service, 'syncMentorings').mockResolvedValue([] as any);

      await service.createMentoring(['u1', 'u2'], 'c1');

      expect(spy).toHaveBeenCalledWith(['u1', 'u2'], 'c1');
    });

    it('updateMentoring should call syncMentorings with array', async () => {
      const spy = jest.spyOn(service, 'syncMentorings').mockResolvedValue([] as any);

      await service.updateMentoring(['u1', 'u2'], 'c1');

      expect(spy).toHaveBeenCalledWith(['u1', 'u2'], 'c1');
    });
  });
});
