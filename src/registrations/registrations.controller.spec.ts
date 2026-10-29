import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { UploadService } from 'src/common/upload/upload.service';

describe('RegistrationsController', () => {
  let controller: RegistrationsController;

  const mockRegistrationsService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findRegistration: jest.fn(),
    findOne: jest.fn(),
    addUserToCourse: jest.fn(),
    removeCourseUser: jest.fn(),
    update: jest.fn(),
    deleteFile: jest.fn(),
  });

  const mockUploadService = () => ({
    uploadImage: jest.fn(),
    deleteFile: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationsController],
      providers: [
        {
          provide: RegistrationsService,
          useFactory: mockRegistrationsService,
        },
        {
          provide: UploadService,
          useFactory: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<RegistrationsController>(RegistrationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
