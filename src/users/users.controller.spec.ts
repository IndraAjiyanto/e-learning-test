import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { UploadService } from 'src/common/upload/upload.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAllPaginated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: UploadService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return 400 and json error with email field on duplicate email for ajax requests', async () => {
      usersService.create!.mockRejectedValue(
        new BadRequestException(
          'Email sudah terdaftar. Silakan gunakan alamat email lain.',
        ),
      );

      const mockReq = {
        xhr: true,
        headers: {},
        body: {},
        flash: jest.fn(),
      } as unknown as Request;

      const statusSpy = jest.fn().mockReturnThis();
      const jsonSpy = jest.fn();
      const mockRes = {
        status: statusSpy,
        json: jsonSpy,
        redirect: jest.fn(),
      } as unknown as Response;

      const dto = {
        username: 'johndoe',
        email: 'duplicate@example.com',
        password: 'Password1!',
        confirm_password: 'Password1!',
        role: 'user',
      } as unknown as import('./dto/create-user.dto').CreateUserDto;

      await controller.create(dto, mockRes, mockReq);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan alamat email lain.',
        field: 'email',
      });
    });

    it('should return json success on valid ajax creation', async () => {
      usersService.create!.mockResolvedValue({ id: 'uuid-1' } as any);

      const mockReq = {
        xhr: true,
        headers: {},
        body: {},
        flash: jest.fn(),
      } as unknown as Request;

      const jsonSpy = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jsonSpy,
        redirect: jest.fn(),
      } as unknown as Response;

      const dto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password1!',
        confirm_password: 'Password1!',
        role: 'user',
      } as unknown as import('./dto/create-user.dto').CreateUserDto;

      await controller.create(dto, mockRes, mockReq);

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        redirect: '/users',
      });
    });
  });
});
