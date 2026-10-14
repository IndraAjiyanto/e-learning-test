import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Certificates } from 'src/entities/certificate.entity';
import { EmailService } from 'src/common/email/email.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let emailService: {
    sendAdminVerificationEmail: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    emailService = {
      sendAdminVerificationEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Portofolios),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Logbook),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Certificates),
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if email is already registered', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });

      const dto = {
        username: 'existing',
        email: 'test@example.com',
        password: 'Password1!',
        confirm_password: 'Password1!',
      } as unknown as import('./dto/create-user.dto').CreateUserDto;

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);

      await expect(service.create(dto)).rejects.toThrow(
        'Email sudah terdaftar. Silakan gunakan alamat email lain.',
      );
    });

    it('should catch unique constraint error (23505) and throw BadRequestException', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ email: 'test@example.com' });
      userRepository.save.mockRejectedValue({
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      });

      const dto = {
        username: 'concurrent',
        email: 'test@example.com',
        password: 'Password1!',
        confirm_password: 'Password1!',
      } as unknown as import('./dto/create-user.dto').CreateUserDto;

      await expect(service.create(dto)).rejects.toThrow(
        'Email sudah terdaftar. Silakan gunakan alamat email lain.',
      );
    });

    it('should successfully save user when email is not duplicate', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const mockCreated = {
        id: 'new-id',
        email: 'new@example.com',
        username: 'newuser',
      };
      userRepository.create.mockReturnValue(mockCreated);
      userRepository.save.mockResolvedValue(mockCreated);
      emailService.sendAdminVerificationEmail.mockResolvedValue(true);

      const dto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password1!',
        confirm_password: 'Password1!',
      } as unknown as import('./dto/create-user.dto').CreateUserDto;

      const result = await service.create(dto);

      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
    });
  });
});
