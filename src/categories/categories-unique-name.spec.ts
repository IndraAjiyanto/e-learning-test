/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { BadRequestException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';

describe('CategoriesService - Unique Name Validation (Scenario A)', () => {
  let service: CategoriesService;
  let categoryRepoMock: any;
  let courseTypeRepoMock: any;
  let managerMock: any;
  let queryBuilderMock: any;

  beforeEach(() => {
    queryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getOne: jest.fn(),
    };

    managerMock = {
      query: jest.fn().mockResolvedValue([]),
      create: jest.fn((entityClass, data) => ({ ...data, id: 'cat-new-id' })),
      save: jest.fn((cat) => Promise.resolve(cat)),
      transaction: jest.fn((cb) => cb(managerMock)),
    };

    categoryRepoMock = {
      count: jest.fn().mockResolvedValue(1),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
      manager: managerMock,
    };

    courseTypeRepoMock = {
      findByIds: jest.fn().mockResolvedValue([]),
    };

    service = new CategoriesService(
      categoryRepoMock,
      {} as any,
      courseTypeRepoMock,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  describe('getTakenCategoryNames', () => {
    it('should return a list of existing category names', async () => {
      queryBuilderMock.getRawMany.mockResolvedValue([
        { name: 'Web Development' },
        { name: 'UI/UX Design' },
      ]);

      const names = await service.getTakenCategoryNames();

      expect(queryBuilderMock.select).toHaveBeenCalledWith('c.name', 'name');
      expect(queryBuilderMock.where).toHaveBeenCalledWith('c.name IS NOT NULL');
      expect(names).toEqual(['Web Development', 'UI/UX Design']);
    });

    it('should exclude current id if excludeId is provided', async () => {
      queryBuilderMock.getRawMany.mockResolvedValue([
        { name: 'Web Development' },
      ]);

      const names = await service.getTakenCategoryNames('exclude-cat-id');

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'c.id != :excludeId',
        { excludeId: 'exclude-cat-id' },
      );
      expect(names).toEqual(['Web Development']);
    });
  });

  describe('create - unique name check', () => {
    const baseDto: CreateCategoriesDto = {
      name: 'Web Development',
      type: 'Paid Program',
      no: 1,
      icon: 'icon.svg',
      description: ['Deskripsi'],
      text: { id: 'Caption ID', en: 'Caption EN', ja: 'Caption JA' } as any,
      contact: '08123456789',
      courseType: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
    };

    it('should reject exact duplicate category name', async () => {
      queryBuilderMock.getOne.mockResolvedValue({
        id: 'existing-id',
        name: 'Web Development',
      });

      await expect(
        service.create({ ...baseDto, name: 'Web Development' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate with different case (case-insensitive)', async () => {
      queryBuilderMock.getOne.mockResolvedValue({
        id: 'existing-id',
        name: 'Web Development',
      });

      await expect(
        service.create({ ...baseDto, name: 'web development' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate with multiple / leading / trailing spaces', async () => {
      queryBuilderMock.getOne.mockResolvedValue({
        id: 'existing-id',
        name: 'Web Development',
      });

      await expect(
        service.create({ ...baseDto, name: '   Web    Development   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if name is empty or only whitespace', async () => {
      await expect(service.create({ ...baseDto, name: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should succeed when category name is unique', async () => {
      queryBuilderMock.getOne.mockResolvedValue(null);

      const result = await service.create({
        ...baseDto,
        name: 'Mobile Development',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Mobile Development');
      expect(managerMock.save).toHaveBeenCalled();
    });

    it('Scenario A: query checks exact word sequence matching against normalized expression', async () => {
      queryBuilderMock.getOne.mockResolvedValue(null);

      await service.create({ ...baseDto, name: 'Development Web' });

      expect(categoryRepoMock.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(REGEXP_REPLACE(TRIM(c.name)'),
        { normalizedName: 'Development Web' },
      );
    });
  });
});
