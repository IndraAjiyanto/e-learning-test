import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InstallmentPayment } from '../entities/installment-payment.entity';
import { InstallmentPaymentService } from './installment-payment.service';

describe('InstallmentPaymentService', () => {
  let service: InstallmentPaymentService;
  let repo: Record<string, jest.Mock>;

  const queryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => ({ ...data })),
      save: jest.fn((row) => Promise.resolve(row)),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilderMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallmentPaymentService,
        {
          provide: getRepositoryToken(InstallmentPayment),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<InstallmentPaymentService>(InstallmentPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates then saves the row', async () => {
      repo.save.mockResolvedValue({ id: 'i1', month: 2, status: 'process' });
      const result = await service.create({ month: 2, status: 'process' });

      expect(repo.create).toHaveBeenCalledWith({ month: 2, status: 'process' });
      expect(repo.save).toHaveBeenCalled();
      expect(result.month).toBe(2);
    });
  });

  describe('save', () => {
    it('persists an existing row', async () => {
      const row = { id: 'i1', status: 'approved' } as InstallmentPayment;
      await service.save(row);
      expect(repo.save).toHaveBeenCalledWith(row);
    });
  });

  describe('findByNo', () => {
    it('queries by no with payment.course relation', async () => {
      const expected = { id: 'i1', no: 'INV-M1-123' };
      repo.findOne.mockResolvedValue(expected);

      const result = await service.findByNo('INV-M1-123');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { no: 'INV-M1-123' },
        relations: ['payment', 'payment.course'],
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findByPaymentId', () => {
    it('queries rows ordered by month asc', async () => {
      const rows = [{ month: 1 }, { month: 2 }];
      repo.find.mockResolvedValue(rows);

      const result = await service.findByPaymentId('p1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { payment: { id: 'p1' } },
        relations: ['payment'],
        order: { month: 'ASC' },
      });
      expect(result).toEqual(rows);
    });
  });

  describe('findOneByPaymentAndMonth', () => {
    it('finds a single row by payment and month', async () => {
      const row = { payment: { id: 'p1' }, month: 3 };
      repo.findOne.mockResolvedValue(row);

      const result = await service.findOneByPaymentAndMonth('p1', 3);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { payment: { id: 'p1' }, month: 3 },
        relations: ['payment'],
      });
      expect(result).toEqual(row);
    });
  });

  describe('findByPaymentIds', () => {
    it('returns [] when no ids provided', async () => {
      const result = await service.findByPaymentIds([]);
      expect(result).toEqual([]);
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('queries by IN ids ordered by month', async () => {
      const rows = [{ month: 1 }, { month: 2 }];
      queryBuilderMock.getMany.mockResolvedValue(rows);

      const result = await service.findByPaymentIds(['p1', 'p2']);

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('ip');
      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith(
        'ip.payment',
        'p',
      );
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'p.id IN (:...ids)',
        { ids: ['p1', 'p2'] },
      );
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('ip.month', 'ASC');
      expect(result).toEqual(rows);
    });
  });

  describe('findUnpaidByPaymentId', () => {
    it('returns process rows for a payment', async () => {
      const rows = [{ status: 'process' }];
      repo.find.mockResolvedValue(rows);

      const result = await service.findUnpaidByPaymentId('p1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { payment: { id: 'p1' }, status: 'process' },
      });
      expect(result).toEqual(rows);
    });
  });
});
