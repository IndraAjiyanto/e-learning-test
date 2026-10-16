import { Test, TestingModule } from '@nestjs/testing';
import { CourseTypesService, isValidIconFormat } from './course_types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseType } from 'src/entities/course_type.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CourseTypesService', () => {
  let service: CourseTypesService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'ct-1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseTypesService,
        {
          provide: getRepositoryToken(CourseType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CourseTypesService>(CourseTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isValidIconFormat', () => {
    it('should reject empty or whitespace strings', () => {
      expect(isValidIconFormat('')).toBe(false);
      expect(isValidIconFormat('   ')).toBe(false);
      expect(isValidIconFormat(null as any)).toBe(false);
      expect(isValidIconFormat(undefined as any)).toBe(false);
    });

    it('should reject style prefixes without glyph name', () => {
      expect(isValidIconFormat('fa')).toBe(false);
      expect(isValidIconFormat('fas')).toBe(false);
      expect(isValidIconFormat('far')).toBe(false);
      expect(isValidIconFormat('fab')).toBe(false);
      expect(isValidIconFormat('fa-solid')).toBe(false);
      expect(isValidIconFormat('fa-regular')).toBe(false);
      expect(isValidIconFormat('fa-brands')).toBe(false);
      expect(isValidIconFormat('fa-light')).toBe(false);
      expect(isValidIconFormat('fa-thin')).toBe(false);
      expect(isValidIconFormat('fa-duotone')).toBe(false);
    });

    it('should reject incomplete glyphs or prefix duplicates', () => {
      expect(isValidIconFormat('fa-')).toBe(false);
      expect(isValidIconFormat('fa-solid fa-')).toBe(false);
      expect(isValidIconFormat('fa-solid fa-solid')).toBe(false);
      expect(isValidIconFormat('fa-solid fas')).toBe(false);
      expect(isValidIconFormat('fa-solid fa-regular')).toBe(false);
      expect(isValidIconFormat('fa-code extra words')).toBe(false);
    });

    it('should accept valid single glyph names', () => {
      expect(isValidIconFormat('code')).toBe(true);
      expect(isValidIconFormat('fa-code')).toBe(true);
      expect(isValidIconFormat('circle-check')).toBe(true);
      expect(isValidIconFormat('fa-circle-check')).toBe(true);
      expect(isValidIconFormat('user-graduate')).toBe(true);
      expect(isValidIconFormat('fa-user-graduate')).toBe(true);
    });

    it('should accept valid style prefix + glyph combinations', () => {
      expect(isValidIconFormat('fa-solid fa-code')).toBe(true);
      expect(isValidIconFormat('fa-regular fa-calendar')).toBe(true);
      expect(isValidIconFormat('fa-brands fa-github')).toBe(true);
      expect(isValidIconFormat('fas fa-check')).toBe(true);
      expect(isValidIconFormat('far fa-clock')).toBe(true);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if icon format is invalid or incomplete', async () => {
      const invalidDtos = [
        { nameClassesType: 'Fullstack', icon: 'fa-solid', description: { id: 'a', en: 'b', ja: 'c' } },
        { nameClassesType: 'Fullstack', icon: 'fa-', description: { id: 'a', en: 'b', ja: 'c' } },
        { nameClassesType: 'Fullstack', icon: 'fa-solid fa-', description: { id: 'a', en: 'b', ja: 'c' } },
        { nameClassesType: 'Fullstack', icon: '', description: { id: 'a', en: 'b', ja: 'c' } },
      ];

      for (const dto of invalidDtos) {
        await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
      }
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should save course type successfully when icon is valid', async () => {
      const dto = {
        nameClassesType: 'Backend Developer',
        icon: 'fa-solid fa-code',
        description: { id: 'Deskripsi', en: 'Description', ja: '説明' },
      };

      const result = await service.create(dto as any);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 'ct-1', ...dto });
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if updated icon is invalid', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 'ct-1',
        nameClassesType: 'Frontend',
        icon: 'fa-solid fa-code',
      });

      await expect(
        service.update('ct-1', { icon: 'fa-regular' } as any),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.update('ct-1', { icon: 'fa-' } as any),
      ).rejects.toThrow(BadRequestException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update course type successfully when icon is valid', async () => {
      const existing = {
        id: 'ct-1',
        nameClassesType: 'Frontend',
        icon: 'fa-solid fa-code',
      };
      mockRepository.findOne.mockResolvedValue(existing);

      const result = await service.update('ct-1', { icon: 'fa-solid fa-laptop-code' } as any);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existing,
        icon: 'fa-solid fa-laptop-code',
      });
      expect(result).toBeDefined();
    });

    it('should allow updating without touching icon', async () => {
      const existing = {
        id: 'ct-1',
        nameClassesType: 'Frontend',
        icon: 'fa-solid fa-code',
      };
      mockRepository.findOne.mockResolvedValue(existing);

      await service.update('ct-1', { nameClassesType: 'New Frontend' } as any);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});

