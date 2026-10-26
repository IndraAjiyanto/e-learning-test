import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BulkDeleteService } from './bulk-delete.service';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';

describe('BulkDeleteService', () => {
  let service: BulkDeleteService;
  let dataSourceMock: Partial<DataSource>;
  let repoMock: Partial<Repository<any>>;

  beforeEach(() => {
    repoMock = {
      findBy: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(repoMock),
    };
    service = new BulkDeleteService(dataSourceMock as DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteSelected', () => {
    it('should throw BadRequestException if ids is empty', async () => {
      await expect(service.deleteSelected('category', [])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if entity is unknown', async () => {
      await expect(
        service.deleteSelected('unknown_entity', ['id-1']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should protect super_admin accounts and current user during user bulk deletion', async () => {
      const superAdminUser = { id: 'admin-1', role: 'super_admin' } as User;
      const normalUser = { id: 'user-2', role: 'user', profile: null } as User;
      (repoMock.findBy as jest.Mock).mockResolvedValue([
        superAdminUser,
        normalUser,
      ]);
      (repoMock.remove as jest.Mock).mockResolvedValue([normalUser]);

      const result = await service.deleteSelected(
        'user',
        ['admin-1', 'user-2'],
        { id: 'user-current', role: 'super_admin' },
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(repoMock.remove).toHaveBeenCalledWith([normalUser]);
    });

    it('should block category deletion if category has courses', async () => {
      const catWithCourse = {
        id: 'cat-1',
        name: 'Web Dev',
        courses: [{ id: 'course-1' }],
      } as unknown as Category;
      (repoMock.find as jest.Mock).mockResolvedValue([catWithCourse]);

      await expect(
        service.deleteSelected('category', ['cat-1']),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAll', () => {
    it('should throw BadRequestException if entity is unknown', async () => {
      await expect(service.deleteAll('unknown_entity')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete all non-admin users and protect super_admin accounts', async () => {
      const superAdminUser = { id: 'admin-1', role: 'super_admin' } as User;
      const normalUser = { id: 'user-2', role: 'user', profile: null } as User;
      (repoMock.find as jest.Mock).mockResolvedValue([
        superAdminUser,
        normalUser,
      ]);
      (repoMock.remove as jest.Mock).mockResolvedValue([normalUser]);

      const result = await service.deleteAll('user', {
        id: 'admin-1',
        role: 'super_admin',
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(repoMock.remove).toHaveBeenCalledWith([normalUser]);
    });
  });
});
