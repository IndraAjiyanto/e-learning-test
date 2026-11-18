import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { Payment } from 'src/entities/payment.entity';
import { Registration } from 'src/entities/registration.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { UserCourse } from 'src/entities/user_course.entity';

describe('SearchService', () => {
  let service: SearchService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({ ...mockQueryBuilder })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Course), useValue: mockRepository },
        { provide: getRepositoryToken(Session), useValue: mockRepository },
        { provide: getRepositoryToken(Syllabus), useValue: mockRepository },
        { provide: getRepositoryToken(Payment), useValue: mockRepository },
        { provide: getRepositoryToken(Registration), useValue: mockRepository },
        { provide: getRepositoryToken(Portofolios), useValue: mockRepository },
        { provide: getRepositoryToken(UserCourse), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty results if query is empty or whitespace', async () => {
    const result = await service.search('   ', 'user-123');
    expect(result).toEqual({
      courses: [],
      programs: [],
      learnings: [],
      portfolios: [],
      payments: [],
      menus: [],
    });
  });

  it('should return empty results if userId is undefined (only authenticated dashboard search allowed)', async () => {
    const result = await service.search('react');
    expect(result).toEqual({
      courses: [],
      programs: [],
      learnings: [],
      portfolios: [],
      payments: [],
      menus: [],
    });
  });

  it('should match user dashboard menus when userId is present', async () => {
    const result = await service.search('dashboard', 'user-123');
    expect(result.menus.some((m) => m.title === 'Dashboard')).toBe(true);

    const profileResult = await service.search('password', 'user-123');
    expect(profileResult.menus.some((m) => m.title === 'Profile')).toBe(true);
  });
});
