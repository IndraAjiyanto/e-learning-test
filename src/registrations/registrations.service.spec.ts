import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Registration } from 'src/entities/registration.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Payment } from 'src/entities/payment.entity';
import { InvoiceService } from 'src/invoice/invoice.service';

describe('RegistrationsService', () => {
  let service: RegistrationsService;

  const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const mockInvoiceService = () => ({
    createInvoiceForRegistration: jest.fn(),
    generateInvoiceNumber: jest.fn(),
    saveInvoice: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        {
          provide: getRepositoryToken(Registration),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(Course),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(UserCourse),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: mockRepo,
        },
        {
          provide: InvoiceService,
          useFactory: mockInvoiceService,
        },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
