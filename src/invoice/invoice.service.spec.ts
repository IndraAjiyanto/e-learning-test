import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { UserCourse } from '../entities/user_course.entity';
import { Course } from '../entities/course.entity';
import { InvoiceService } from './invoice.service';
import { InstallmentPaymentService } from '../installment_payment/installment-payment.service';
import { PaymentsService } from '../payments/payments.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepo: Record<string, jest.Mock>;
  let paymentRepo: Record<string, jest.Mock>;
  let userCourseRepo: Record<string, jest.Mock>;
  let paymentsService: { addUserToCourse: jest.Mock };
  let installmentService: {
    findByNo: jest.Mock;
    save: jest.Mock;
  };

  const mockClient = {
    getInvoiceById: jest.fn(),
    createInvoice: jest.fn(),
  };

  beforeEach(async () => {
    invoiceRepo = { save: jest.fn((x) => Promise.resolve(x)) };
    paymentRepo = { findOne: jest.fn(), save: jest.fn((x) => Promise.resolve(x)) };
    userCourseRepo = { findOne: jest.fn() };
    paymentsService = { addUserToCourse: jest.fn().mockResolvedValue(undefined) };
    installmentService = {
      findByNo: jest.fn(),
      save: jest.fn((x) => Promise.resolve(x)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(UserCourse), useValue: userCourseRepo },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: InstallmentPaymentService, useValue: installmentService },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    (service as any).xenditInvoiceClient = mockClient;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getXenditInvoiceStatus', () => {
    it('returns null when no client configured', async () => {
      (service as any).xenditInvoiceClient = null;
      const result = await service.getXenditInvoiceStatus('x1');
      expect(result).toBeNull();
    });

    it('returns null when no invoice id provided', async () => {
      const result = await service.getXenditInvoiceStatus(undefined);
      expect(result).toBeNull();
    });

    it('returns status and paidAt from Xendit', async () => {
      mockClient.getInvoiceById.mockResolvedValue({
        status: 'PAID',
        paid_at: '2026-01-05T00:00:00.000Z',
      });

      const result = await service.getXenditInvoiceStatus('x1');

      expect(mockClient.getInvoiceById).toHaveBeenCalledWith({
        invoiceId: 'x1',
      });
      expect(result).toEqual({
        status: 'PAID',
        paidAt: new Date('2026-01-05T00:00:00.000Z'),
      });
    });

    it('returns null when Xendit call throws', async () => {
      mockClient.getInvoiceById.mockRejectedValue(new Error('network'));
      const result = await service.getXenditInvoiceStatus('x1');
      expect(result).toBeNull();
    });
  });

  describe('settleStuckPayment', () => {
    const makePayment = (overrides: Record<string, any> = {}) => ({
      id: 'p1',
      process: 'process',
      dpPaidAt: null,
      installment: null,
      invoice: { id: 'inv1', xendit_invoice_id: 'x1', paid_at: null },
      user: { id: 'u1' },
      course: { id: 'c1' },
      ...overrides,
    });

    it('returns early when payment not in process', async () => {
      paymentRepo.findOne.mockResolvedValue(makePayment({ process: 'approved' }));
      const result = await service.settleStuckPayment('p1');
      expect(paymentRepo.save).not.toHaveBeenCalled();
      expect(result!.process).toBe('approved');
    });

    it('marks approved and enrolls when Xendit says PAID', async () => {
      paymentRepo.findOne.mockResolvedValue(makePayment());
      mockClient.getInvoiceById.mockResolvedValue({
        status: 'SETTLED',
        paid_at: '2026-01-05T00:00:00.000Z',
      });
      userCourseRepo.findOne.mockResolvedValue(null);

      await service.settleStuckPayment('p1');

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ process: 'approved' }),
      );
      expect(invoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          paid_at: new Date('2026-01-05T00:00:00.000Z'),
        }),
      );
      expect(paymentsService.addUserToCourse).toHaveBeenCalledWith('u1', 'c1');
    });

    it('sets dpPaidAt for installment payment without re-enrolling', async () => {
      paymentRepo.findOne.mockResolvedValue(
        makePayment({ installment: {} }),
      );
      mockClient.getInvoiceById.mockResolvedValue({
        status: 'PAID',
        paid_at: '2026-02-02T00:00:00.000Z',
      });
      userCourseRepo.findOne.mockResolvedValue({ id: 'uc1' });

      await service.settleStuckPayment('p1');

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ dpPaidAt: new Date('2026-02-02T00:00:00.000Z') }),
      );
      expect(paymentsService.addUserToCourse).not.toHaveBeenCalled();
    });

    it('marks rejected when EXPIRED', async () => {
      paymentRepo.findOne.mockResolvedValue(makePayment());
      mockClient.getInvoiceById.mockResolvedValue({ status: 'EXPIRED' });

      await service.settleStuckPayment('p1');

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ process: 'rejected' }),
      );
    });
  });

  describe('handleXenditWebhook', () => {
    it('marks installment row approved when paid', async () => {
      const row = { id: 'i1', month: 2, status: 'process', paidAt: null };
      installmentService.findByNo.mockResolvedValue(row);

      await service.handleXenditWebhook(
        { external_id: 'INV-M2-1', status: 'PAID' },
        '',
      );

      expect(installmentService.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved', month: 2 }),
      );
      expect(paymentRepo.findOne).not.toHaveBeenCalled();
    });

    it('marks installment row rejected when expired', async () => {
      const row = { id: 'i1', month: 2, status: 'process' };
      installmentService.findByNo.mockResolvedValue(row);

      await service.handleXenditWebhook(
        { external_id: 'INV-M2-1', status: 'EXPIRED' },
        '',
      );

      expect(installmentService.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'rejected' }),
      );
    });

    it('rejects unauthorized callback token', async () => {
      process.env.XENDIT_CALLBACK_TOKEN = 'secret';
      await expect(
        service.handleXenditWebhook(
          { external_id: 'x', status: 'PAID' },
          'wrong',
        ),
      ).rejects.toThrow('Unauthorized');
      delete process.env.XENDIT_CALLBACK_TOKEN;
    });
  });
});
