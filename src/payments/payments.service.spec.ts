import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
import { Registration } from '../entities/registration.entity';
import { Installment } from '../entities/installment.entity';
import { UserCourse } from '../entities/user_course.entity';
import { WeekProgress } from '../entities/week_progress.entity';
import { SessionProgress } from '../entities/session_progress.entity';
import { Weeks } from '../entities/weeks.entity';
import { Session } from '../entities/session.entity';
import { VoucherService } from '../voucher/voucher.service';
import { InvoiceService } from '../invoice/invoice.service';
import { PaymentsService } from './payments.service';
import { InstallmentPaymentService } from '../installment_payment/installment-payment.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: Record<string, jest.Mock>;
  let installmentService: Record<string, jest.Mock>;
  let invoiceService: Record<string, jest.Mock>;

  beforeEach(async () => {
    paymentRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((x) => Promise.resolve(x)),
      create: jest.fn((x) => ({ ...x })),
    };
    installmentService = {
      findByPaymentId: jest.fn().mockResolvedValue([]),
      findByPaymentIds: jest.fn().mockResolvedValue([]),
      findOneByPaymentAndMonth: jest.fn(),
      save: jest.fn((x) => Promise.resolve(x)),
      create: jest.fn((x) => ({ id: 'i-' + Date.now(), ...x })),
    };
    invoiceService = {
      getXenditInvoiceStatus: jest.fn(),
      settleStuckPayment: jest.fn().mockResolvedValue(undefined),
      createInvoiceForPayment: jest.fn(),
      createInvoiceForInstallment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Registration), useValue: {} },
        { provide: getRepositoryToken(Installment), useValue: {} },
        { provide: getRepositoryToken(UserCourse), useValue: {} },
        { provide: getRepositoryToken(WeekProgress), useValue: {} },
        { provide: getRepositoryToken(SessionProgress), useValue: {} },
        { provide: getRepositoryToken(Weeks), useValue: {} },
        { provide: getRepositoryToken(Session), useValue: {} },
        { provide: VoucherService, useValue: {} },
        { provide: InvoiceService, useValue: invoiceService },
        { provide: InstallmentPaymentService, useValue: installmentService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reconcileUserPayments', () => {
    it('calls settleStuckPayment for each process payment with invoice', async () => {
      paymentRepo.find
        .mockResolvedValueOnce([
          { id: 'p1', process: 'process', invoice: { xendit_invoice_id: 'x1' } },
          { id: 'p2', process: 'approved', invoice: {} },
        ])
        .mockResolvedValueOnce([]);

      await service.reconcileUserPayments('u1');

      expect(invoiceService.settleStuckPayment).toHaveBeenCalledWith('p1');
      expect(invoiceService.settleStuckPayment).not.toHaveBeenCalledWith('p2');
    });

    it('reconciles installment rows via Xendit status', async () => {
      paymentRepo.find
        .mockResolvedValueOnce([{ id: 'p1', process: 'approved', invoice: null }])
        .mockResolvedValueOnce([{ id: 'p1' }]);

      installmentService.findByPaymentId.mockResolvedValue([
        { id: 'ip1', month: 2, status: 'process', xendit_invoice_id: 'xi1' },
        { id: 'ip2', month: 3, status: 'process', xendit_invoice_id: null },
      ]);
      invoiceService.getXenditInvoiceStatus.mockResolvedValue({
        status: 'PAID',
        paidAt: new Date('2026-01-01'),
      });

      await service.reconcileUserPayments('u1');

      expect(invoiceService.getXenditInvoiceStatus).toHaveBeenCalledWith('xi1');
      expect(installmentService.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved', month: 2 }),
      );
    });

    it('marks expired installment rows as rejected', async () => {
      paymentRepo.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 'p1' }]);

      installmentService.findByPaymentId.mockResolvedValue([
        { id: 'ip1', month: 1, status: 'process', xendit_invoice_id: 'xi1' },
      ]);
      invoiceService.getXenditInvoiceStatus.mockResolvedValue({ status: 'EXPIRED' });

      await service.reconcileUserPayments('u1');

      expect(installmentService.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'rejected', month: 1 }),
      );
    });
  });

  describe('getUserInstallmentDetail', () => {
    it('calls reconcileUserPayments first', async () => {
      paymentRepo.find.mockResolvedValue([]);
      installmentService.findByPaymentIds.mockResolvedValue([]);

      const spy = jest.spyOn(service, 'reconcileUserPayments').mockResolvedValue(undefined);

      await service.getUserInstallmentDetail('u1');

      expect(spy).toHaveBeenCalledWith('u1');
      spy.mockRestore();
    });

    it('returns enriched detail with monthly schedule', async () => {
      const parent = {
        id: 'p1',
        process: 'approved',
        dpPaidAt: new Date('2030-01-01'),
        createdAt: new Date('2030-01-01'),
        installment: { downPayment: 1000000, price: [500000, 500000, 500000], month: 3 },
        course: { id: 'c1', name: 'UI/UX', category: { name: 'Design' }, startDate: new Date(), startEnd: new Date() },
        invoice: {},
      };
      paymentRepo.find.mockResolvedValue([parent]);
      installmentService.findByPaymentIds.mockResolvedValue([
        { payment: { id: 'p1' }, month: 1, status: 'approved', xendit_invoice_id: 'x1', paidAt: new Date('2026-02-01') },
      ]);

      jest.spyOn(service, 'reconcileUserPayments').mockResolvedValue(undefined);

      const result = await service.getUserInstallmentDetail('u1');

      expect(result).toHaveLength(1);
      expect(result[0].totalProgramFee).toBe(2500000);
      expect(result[0].downPayment).toBe(1000000);
      expect(result[0].monthly).toHaveLength(3);
      expect(result[0].monthly[0].status).toBe('paid');
      expect(result[0].monthly[1].status).toBe('upcoming');
    });
  });

  describe('createMonthlyInstallmentInvoice', () => {
    it('throws when parent not found', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createMonthlyInstallmentInvoice('u1', 'p1', 1),
      ).rejects.toThrow('Rencana cicilan tidak ditemukan');
    });

    it('throws when parent is not process=approved', async () => {
      paymentRepo.findOne.mockResolvedValue({
        process: 'process',
        installment: {},
        user: { id: 'u1' },
      });
      await expect(
        service.createMonthlyInstallmentInvoice('u1', 'p1', 1),
      ).rejects.toThrow('Pembayaran DP belum lunas/approved');
    });

    it('throws when month already paid', async () => {
      paymentRepo.findOne.mockResolvedValue({
        id: 'p1',
        process: 'approved',
        dpPaidAt: new Date(),
        installment: { price: [500000] },
        user: { id: 'u1' },
        course: { name: 'UI/UX' },
      });
      installmentService.findOneByPaymentAndMonth.mockResolvedValue({
        status: 'approved',
      });
      await expect(
        service.createMonthlyInstallmentInvoice('u1', 'p1', 1),
      ).rejects.toThrow('Cicilan bulan ini sudah lunas');
    });

    it('creates installment payment and calls createInvoiceForInstallment', async () => {
      paymentRepo.findOne.mockResolvedValue({
        id: 'p1',
        process: 'approved',
        dpPaidAt: new Date(),
        installment: { price: [500000, 600000] },
        user: { id: 'u1', email: 'a@b.com' },
        course: { name: 'UI/UX' },
      });
      installmentService.findOneByPaymentAndMonth.mockResolvedValue(null);
      installmentService.create.mockResolvedValue({ id: 'ip1', month: 1, no: 'INV-M1-123' });
      invoiceService.createInvoiceForInstallment.mockResolvedValue({ id: 'ip1', xendit_invoice_url: 'https://x.com' });

      const result = await service.createMonthlyInstallmentInvoice('u1', 'p1', 1);

      const createCall = installmentService.create.mock.calls[0][0];
      expect(createCall.month).toBe(1);
      expect(createCall.amount).toBe(500000);
      expect(createCall.payment.id).toBe('p1');
      expect(invoiceService.createInvoiceForInstallment).toHaveBeenCalled();
      expect(result.xendit_invoice_url).toBe('https://x.com');
    });
  });
});
