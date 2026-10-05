import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { InvoiceService } from '../invoice/invoice.service';
import { UploadService } from '../common/upload/upload.service';
import { PaymentSettingsService } from '../payment-settings/payment-settings.service';
import { InstallmentPaymentService } from '../installment_payment/installment-payment.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: Record<string, jest.Mock>;
  let invoiceService: Record<string, jest.Mock>;

  beforeEach(async () => {
    paymentsService = {
      getPaymentByNo: jest.fn(),
      getInstallmentPaymentByNo: jest.fn(),
      updateInstallmentPayment: jest.fn(),
      addUserToCourse: jest.fn(),
      findPayment: jest.fn(),
      findRegistration: jest.fn(),
      findInstallments: jest.fn(),
      getUserInstallmentDetail: jest.fn(),
      findCourse: jest.fn(),
      findAll: jest.fn(),
      findAllRegistrations: jest.fn(),
      findAllInstallments: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      createXenditInvoice: jest.fn(),
      reconcileUserPayments: jest.fn(),
      deleteFile: jest.fn(),
      removeCourseUser: jest.fn(),
    };
    invoiceService = {
      settleStuckPayment: jest.fn().mockResolvedValue(undefined),
      getXenditInvoiceStatus: jest.fn(),
      simulatePaymentSuccess: jest.fn(),
      findCourseById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: paymentsService },
        { provide: InvoiceService, useValue: invoiceService },
        {
          provide: PaymentSettingsService,
          useValue: {
            effective: jest.fn().mockResolvedValue({
              manual_enabled: true,
              gateway_enabled: true,
            }),
          },
        },
        {
          provide: InstallmentPaymentService,
          useValue: {
            findOneById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UploadService,
          useValue: { validateImageDimensions: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockReq = { user: { id: 'u1' }, flash: jest.fn() } as any;
    const mockRes = { redirect: jest.fn() } as any;

    beforeEach(() => {
      mockReq.flash.mockClear();
      mockRes.redirect.mockClear();
    });

    it('redirects back to the course page when the invoice URL is null', async () => {
      paymentsService.createXenditInvoice.mockResolvedValue({
        id: 'p1',
        process: 'process',
        invoice: { xendit_invoice_url: null },
      });

      await controller.create('u1', 'c1', {}, mockRes, mockReq);

      expect(mockRes.redirect).toHaveBeenCalledWith('/payment/detail/c1');
      expect(mockRes.redirect).not.toHaveBeenCalledWith(null);
      // Guard dan `catch` sama-sama redirect ke /payment/detail/:courseId, jadi
      // flash toast error yang membuktikan yang benar-benar guard yang bekerja.
      expect(mockReq.flash).toHaveBeenCalledWith(
        'toastError',
        expect.stringContaining('Payment unavailable'),
      );
    });

    it('redirects to the Xendit invoice URL when it exists', async () => {
      paymentsService.createXenditInvoice.mockResolvedValue({
        id: 'p1',
        process: 'process',
        invoice: { xendit_invoice_url: 'https://checkout.xendit.co/x' },
      });

      await controller.create('u1', 'c1', {}, mockRes, mockReq);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'https://checkout.xendit.co/x',
      );
      expect(mockReq.flash).not.toHaveBeenCalledWith(
        'toastError',
        expect.anything(),
      );
    });
  });

  describe('paymentSuccess', () => {
    const mockReq = { user: { id: 'u1' }, flash: jest.fn() } as any;
    const mockRes = { redirect: jest.fn(), render: jest.fn() } as any;

    it('calls settleStuckPayment when order is not approved', async () => {
      const order = {
        id: 'p1',
        no: 'INV-123',
        process: 'process',
        course: { id: 'c1' },
        installment: null,
      };
      paymentsService.getInstallmentPaymentByNo.mockResolvedValue(null);
      paymentsService.getPaymentByNo
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce({ ...order, process: 'approved' });
      invoiceService.settleStuckPayment.mockResolvedValue(order);

      await controller.paymentSuccess('INV-123', mockRes, mockReq);

      expect(invoiceService.settleStuckPayment).toHaveBeenCalledWith('p1');
    });

    it('does not call settleStuckPayment when order is already approved', async () => {
      const order = {
        id: 'p1',
        no: 'INV-123',
        process: 'approved',
        course: { id: 'c1' },
        installment: null,
      };
      paymentsService.getInstallmentPaymentByNo.mockResolvedValue(null);
      paymentsService.getPaymentByNo.mockResolvedValue(order);

      await controller.paymentSuccess('INV-123', mockRes, mockReq);

      expect(invoiceService.settleStuckPayment).not.toHaveBeenCalled();
    });

    it('calls getXenditInvoiceStatus for installment redirect', async () => {
      const installment = {
        id: 'ip1',
        status: 'process',
        xendit_invoice_id: 'xi1',
      };
      paymentsService.getInstallmentPaymentByNo.mockResolvedValue(installment);
      invoiceService.getXenditInvoiceStatus.mockResolvedValue({
        status: 'PAID',
        paidAt: new Date(),
      });

      await controller.paymentSuccess('INV-M1-123', mockRes, mockReq);

      expect(invoiceService.getXenditInvoiceStatus).toHaveBeenCalledWith('xi1');
      expect(installment.status).toBe('approved');
      expect(paymentsService.updateInstallmentPayment).toHaveBeenCalledWith(
        installment,
      );
    });

    it('does not approve installment when Xendit status is not PAID', async () => {
      const installment = {
        id: 'ip1',
        status: 'process',
        xendit_invoice_id: 'xi1',
      };
      paymentsService.getInstallmentPaymentByNo.mockResolvedValue(installment);
      invoiceService.getXenditInvoiceStatus.mockResolvedValue({
        status: 'PENDING',
      });

      await controller.paymentSuccess('INV-M1-123', mockRes, mockReq);

      expect(installment.status).toBe('process');
      expect(paymentsService.updateInstallmentPayment).not.toHaveBeenCalled();
    });
  });
});
