import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { Voucher } from 'src/entities/voucher.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';

describe('VoucherService', () => {
  let service: VoucherService;
  let voucherRepo: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };
  let courseRepo: {
    findBy: jest.Mock;
    find: jest.Mock;
  };
  let userRepo: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    voucherRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    courseRepo = {
      findBy: jest.fn(),
      find: jest.fn(),
    };
    userRepo = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: getRepositoryToken(Voucher),
          useValue: voucherRepo,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: courseRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByCode', () => {
    it('returns null if code is empty', async () => {
      const result = await service.findByCode('   ');
      expect(result).toBeNull();
      expect(voucherRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('queries voucher with case-insensitive lowercase match', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'v1', code_voucher: 'DISKON50' }),
      };
      voucherRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findByCode('diskon50');
      expect(voucherRepo.createQueryBuilder).toHaveBeenCalledWith('voucher');
      expect(qb.where).toHaveBeenCalledWith(
        'LOWER(voucher.code_voucher) = LOWER(:code)',
        { code: 'diskon50' },
      );
      expect(result).toEqual({ id: 'v1', code_voucher: 'DISKON50' });
    });
  });

  describe('isCodeAvailable', () => {
    it('returns true if no existing voucher matches code', async () => {
      jest.spyOn(service, 'findByCode').mockResolvedValue(null);
      const available = await service.isCodeAvailable('NEWCODE');
      expect(available).toBe(true);
    });

    it('returns false if existing voucher found and no excludeId given', async () => {
      jest.spyOn(service, 'findByCode').mockResolvedValue({
        id: 'v1',
        code_voucher: 'EXISTING',
      } as Voucher);
      const available = await service.isCodeAvailable('EXISTING');
      expect(available).toBe(false);
    });

    it('returns true if existing voucher has same id as excludeId (self update)', async () => {
      jest.spyOn(service, 'findByCode').mockResolvedValue({
        id: 'v1',
        code_voucher: 'EXISTING',
      } as Voucher);
      const available = await service.isCodeAvailable('EXISTING', 'v1');
      expect(available).toBe(true);
    });

    it('returns false if existing voucher belongs to a different id', async () => {
      jest.spyOn(service, 'findByCode').mockResolvedValue({
        id: 'v2',
        code_voucher: 'EXISTING',
      } as Voucher);
      const available = await service.isCodeAvailable('EXISTING', 'v1');
      expect(available).toBe(false);
    });
  });

  describe('create', () => {
    it('throws ConflictException if voucher code is already in use', async () => {
      jest.spyOn(service, 'isCodeAvailable').mockResolvedValue(false);

      await expect(
        service.create({
          code_voucher: 'DUPLICATE',
          type: 'discount',
          percent: '10',
        }),
      ).rejects.toThrow(ConflictException);

      expect(voucherRepo.save).not.toHaveBeenCalled();
    });

    it('creates and saves voucher successfully if code is available', async () => {
      jest.spyOn(service, 'isCodeAvailable').mockResolvedValue(true);
      voucherRepo.create.mockImplementation((data) => data);
      voucherRepo.save.mockImplementation(async (data) => ({ id: 'new-id', ...data }));

      const result = await service.create({
        code_voucher: 'UNIQUECODE',
        type: 'discount',
        percent: '20',
        active: 'true',
      });

      expect(result).toMatchObject({
        code_voucher: 'UNIQUECODE',
        type: 'discount',
        percent: 20,
        active: true,
      });
      expect(voucherRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws ConflictException if updated code is taken by another voucher', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'v1',
        code_voucher: 'OLDCODE',
      } as Voucher);
      jest.spyOn(service, 'isCodeAvailable').mockResolvedValue(false);

      await expect(
        service.update('v1', { code_voucher: 'TAKENCODE' }),
      ).rejects.toThrow(ConflictException);

      expect(voucherRepo.save).not.toHaveBeenCalled();
    });

    it('saves updated voucher when code is available', async () => {
      const existing = {
        id: 'v1',
        code_voucher: 'OLDCODE',
        type: 'discount',
      } as Voucher;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      jest.spyOn(service, 'isCodeAvailable').mockResolvedValue(true);
      voucherRepo.save.mockImplementation(async (data) => data);

      const result = await service.update('v1', {
        code_voucher: 'NEWCODE',
      });

      expect(result.code_voucher).toBe('NEWCODE');
      expect(voucherRepo.save).toHaveBeenCalled();
    });
  });
});
