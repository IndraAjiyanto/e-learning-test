import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payment.entity';
import { Invoice, InvoiceStatus } from 'src/entities/invoice.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Invoice as InvoiceClient } from 'xendit-node';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from 'src/payments/payments.service';
import { InstallmentPaymentService } from 'src/installment_payment/installment-payment.service';
import { InstallmentPayment } from 'src/entities/installment-payment.entity';
import { Installment } from 'src/entities/installment.entity';

@Injectable()
export class InvoiceService {
  private xenditInvoiceClient: InvoiceClient;

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly installmentPaymentService: InstallmentPaymentService,
  ) {
    if (process.env.XENDIT_SECRET_KEY) {
      this.xenditInvoiceClient = new InvoiceClient({
        secretKey: process.env.XENDIT_SECRET_KEY,
      });
    }

    if (!process.env.XENDIT_CALLBACK_TOKEN) {
      console.warn(
        '[InvoiceService] PERINGATAN: XENDIT_CALLBACK_TOKEN belum diatur di environment variable. Callback verification tidak akan memvalidasi token.',
      );
    }
  }

  private async generateInvoiceNumber(date = new Date()): Promise<string> {
    const months = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const count = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoice_number LIKE :pattern', {
        pattern: `WSA-KA.%/KW/${month}/${year}`,
      })
      .getCount();
    const seq = String(count + 1).padStart(3, '0');
    return `WSA-KA.${seq}/KW/${month}/${year}`;
  }

  async createInvoiceForPayment(
    payment: Payment,
    finalTotal: number,
    payerEmail: string,
    courseName: string,
    paymentMethod: string,
    subtotal: number,
    discountAmount: number,
    user?: User,
    course?: Course,
  ) {
    if (!this.xenditInvoiceClient) {
      throw new Error(
        'Xendit is not configured. Please add XENDIT_SECRET_KEY to .env',
      );
    }

    const invoiceStatus: InvoiceStatus = finalTotal <= 0 ? 'paid' : 'pending';

    const coursePrice = course?.price ? Number(course.price) : null;
    const coursePromo = course?.promo ? Number(course.promo) : null;
    const courseDiscount =
      coursePrice && coursePromo && coursePrice > coursePromo
        ? coursePrice - coursePromo
        : 0;

    const invoice = this.invoiceRepository.create({
      payment: payment,
      price: coursePrice,
      promo: coursePromo,
      promo_code: discountAmount ?? 0,
      subtotal: finalTotal,
      discount_amount: courseDiscount,
      final_total: finalTotal,
      payment_method: paymentMethod,
      invoice_number: await this.generateInvoiceNumber(),
      status: invoiceStatus,
      user_fullname:
        payment.user_fullname ||
        (user as any)?.biodata?.fullName ||
        user?.username ||
        null,
      user_email: payment.user_email || user?.email || payerEmail,
      user_phone: payment.user_no || (user as any)?.biodata?.no || null,
      course_name: courseName,
      category_name: course?.category?.name || null,
      proof_url: payment.file || null,
      user: user || payment.user || undefined,
      course: course || payment.course || undefined,
    });

    await this.invoiceRepository.save(invoice);

    if (finalTotal <= 0) {
      invoice.paid_at = new Date();
      invoice.status = 'paid';
      await this.invoiceRepository.save(invoice);

      payment.invoice = invoice;
      return payment;
    }

    const appUrl = process.env.APP_URL_LMS || 'http://localhost:3000';
    try {
      const xenditResponse = await this.xenditInvoiceClient.createInvoice({
        data: {
          externalId: payment.no,
          amount: finalTotal,
          payerEmail: payerEmail || 'guest@example.com',
          description: `Payment for ${courseName} - ${paymentMethod}`,
          successRedirectUrl: `${appUrl}/payment/success/${payment.no}`,
          failureRedirectUrl: `${appUrl}/payment/failed/${payment.no}`,
          currency: 'IDR',
        },
      });

      invoice.xendit_invoice_id = xenditResponse.id || '';
      invoice.xendit_invoice_url = xenditResponse.invoiceUrl;
      await this.invoiceRepository.save(invoice);

      // Return both for the controller
      payment.invoice = invoice;
      return payment;
    } catch (error) {
      payment.process = 'rejected';
      await this.paymentRepository.save(payment);
      throw new Error('Gagal terhubung dengan Xendit Payment Gateway');
    }
  }

  async createManualInvoice(
    payment: Payment,
    course: Course,
    user: User,
    installment?: Installment,
    discountAmount: number = 0,
    finalTotalParam?: number,
  ) {
    const isInstallment = !!installment;
    const price = course?.price ? Number(course.price) : null;
    const promo = course?.promo ? Number(course.promo) : null;
    const basePrice = isInstallment
      ? Number(installment.downPayment)
      : promo && promo > 0
        ? promo
        : (price ?? 0);
    const finalTotal =
      finalTotalParam !== undefined
        ? finalTotalParam
        : Math.max(0, basePrice - (discountAmount || 0));

    const courseDiscount =
      !isInstallment && price && promo && price > promo ? price - promo : 0;

    const invoice = this.invoiceRepository.create({
      payment: payment,
      price: price,
      promo: promo,
      promo_code: discountAmount || 0,
      subtotal: finalTotal,
      discount_amount: courseDiscount,
      final_total: finalTotal,
      payment_method: isInstallment ? 'Installment' : 'Manual Transfer',
      invoice_number: await this.generateInvoiceNumber(),
      status: 'pending',
      user_fullname:
        payment.user_fullname ||
        (user as any)?.biodata?.fullName ||
        user?.username ||
        null,
      user_email: payment.user_email || user?.email || null,
      user_phone: payment.user_no || (user as any)?.biodata?.no || null,
      course_name: course.name,
      category_name: course.category?.name || null,
      proof_url: payment.file || null,
      user: user,
      course: course,
    });

    const saved = await this.invoiceRepository.save(invoice);
    payment.invoice = saved;
    return saved;
  }

  async createInvoiceForInstallment(
    row: InstallmentPayment,
    finalTotal: number,
    payerEmail: string,
    courseName: string,
  ) {
    if (!this.xenditInvoiceClient) {
      throw new Error(
        'Xendit is not configured. Please add XENDIT_SECRET_KEY to .env',
      );
    }

    const appUrl = process.env.APP_URL_LMS || 'http://localhost:3000';

    if (finalTotal <= 0) {
      row.status = 'approved';
      row.paidAt = new Date();
      await this.installmentPaymentService.save(row);
      return row;
    }

    try {
      const xenditResponse = await this.xenditInvoiceClient.createInvoice({
        data: {
          externalId: row.no,
          amount: finalTotal,
          payerEmail: payerEmail || 'guest@example.com',
          description: `Pembayaran Cicilan Bulan ${row.month} - ${courseName}`,
          successRedirectUrl: `${appUrl}/payment/success/${row.no}`,
          failureRedirectUrl: `${appUrl}/payment/failed/${row.no}`,
          currency: 'IDR',
        },
      });

      row.xendit_invoice_id = xenditResponse.id || '';
      row.xendit_invoice_url = xenditResponse.invoiceUrl;
      await this.installmentPaymentService.save(row);
      return row;
    } catch (error) {
      row.status = 'rejected';
      await this.installmentPaymentService.save(row);
      throw new Error('Gagal terhubung dengan Xendit Payment Gateway');
    }
  }

  async getXenditInvoiceStatus(xenditInvoiceId?: string) {
    if (!this.xenditInvoiceClient || !xenditInvoiceId) return null;
    try {
      const inv = await this.xenditInvoiceClient.getInvoiceById({
        invoiceId: xenditInvoiceId,
      });
      const paidAt = (inv as any)?.paid_at
        ? new Date((inv as any).paid_at)
        : null;
      return { status: inv.status, paidAt };
    } catch (error) {
      return null;
    }
  }

  // Menutup invoice Xendit yang menggantung. Dipakai saat user memutuskan
  // pindah dari gateway ke kanal manual: invoice lama yang masih PENDING
  // harus ditutup supaya tidak bisa dibayar belakangan dan menghasilkan
  // pembayaran ganda. Kegagalan expire tidak boleh menggagalkan perpindahan
  // kanal, jadi status error dikembalikan, bukan dilempar.
  async expireXenditInvoice(xenditInvoiceId?: string) {
    if (!this.xenditInvoiceClient || !xenditInvoiceId) {
      return { expired: false, reason: 'not_configured' };
    }
    try {
      await this.xenditInvoiceClient.expireInvoice({
        invoiceId: xenditInvoiceId,
      });
      return { expired: true, reason: 'expired' };
    } catch (error) {
      return { expired: false, reason: 'error', error };
    }
  }

  // Menutup invoice Xendit yang masih hidup lalu mengosongkan field-nya, supaya
  // record bisa beralih ke kanal manual tanpa menyisakan link Xendit yang bisa
  // dibayar belakangan (jalur dobel bayar). Field dikosongkan walau expire
  // gagal: `expireXenditInvoice` sengaja mengembalikan status, bukan melempar,
  // supaya kegagalan tidak menggagalkan perpindahan kanal.
  async expireAndClearInvoice(invoice: Invoice) {
    if (!invoice) return;
    if (invoice.xendit_invoice_id) {
      await this.expireXenditInvoice(invoice.xendit_invoice_id);
    }
    invoice.xendit_invoice_id = '';
    invoice.xendit_invoice_url = '';
    await this.invoiceRepository.save(invoice);
  }

  // Menyelesaikan payment (full/DP cicilan) yang 'process' berdasarkan status terbaru dari Xendit
  async settleStuckPayment(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'course', 'invoice', 'installment'],
    });
    if (
      !payment ||
      payment.process !== 'process' ||
      !payment.invoice?.xendit_invoice_id
    ) {
      return payment;
    }

    const res = await this.getXenditInvoiceStatus(
      payment.invoice.xendit_invoice_id,
    );
    if (res && (res.status === 'PAID' || res.status === 'SETTLED')) {
      payment.process = 'approved';
      if (payment.installment && !payment.dpPaidAt) {
        payment.dpPaidAt = res.paidAt || new Date();
      }
      if (payment.invoice) {
        payment.invoice.paid_at = res.paidAt || new Date();
        payment.invoice.status = 'paid';
        await this.invoiceRepository.save(payment.invoice);
      }
      await this.paymentRepository.save(payment);

      const existing = await this.userCourseRepository.findOne({
        where: {
          user: { id: payment.user.id },
          course: { id: payment.course.id },
        },
      });
      if (!existing) {
        await this.paymentsService.addUserToCourse(
          payment.user.id,
          payment.course.id,
        );
      }
    } else if (res && res.status === 'EXPIRED') {
      payment.process = 'rejected';
      if (payment.invoice) {
        payment.invoice.status = 'expired';
        payment.invoice.expired_at = new Date();
        await this.invoiceRepository.save(payment.invoice);
      }
      await this.paymentRepository.save(payment);
    }
    return payment;
  }

  async simulatePaymentSuccess(no: string) {
    const payment = await this.paymentRepository.findOne({
      where: { no },
      relations: ['user', 'course', 'invoice'],
    });
    if (!payment) throw new Error('Payment tidak ditemukan');

    if (payment.invoice && payment.invoice.paid_at) {
      payment.invoice.status = 'paid';
      await this.invoiceRepository.save(payment.invoice);
      return payment;
    }

    if (payment.invoice) {
      payment.invoice.paid_at = new Date();
      payment.invoice.status = 'paid';
      await this.invoiceRepository.save(payment.invoice);
    }

    payment.process = 'approved';
    if (payment.installment && !payment.dpPaidAt) {
      payment.dpPaidAt = new Date();
    }
    await this.paymentRepository.save(payment);

    try {
      await this.paymentsService.addUserToCourse(
        payment.user.id,
        payment.course.id,
      );
    } catch (err) {
      console.error('Error auto-enrolling user after simulated payment:', err);
    }

    return payment;
  }

  async findCourseById(courseId: string) {
    return this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'category', 'installments'],
    });
  }

  async handleXenditWebhook(payload: any, callbackToken: string) {
    const validToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (validToken && callbackToken !== validToken) {
      throw new UnauthorizedException(
        'Unauthorized: Token Webhook Tidak Valid!',
      );
    }

    const externalId = payload.external_id;
    const status = payload.status;

    if (!externalId) return;

    // Pembayaran cicilan bulanan (table terpisah installment_payments)
    const installment =
      await this.installmentPaymentService.findByNo(externalId);
    if (installment) {
      if (status === 'PAID' || status === 'SETTLED') {
        installment.status = 'approved';
        installment.paidAt = new Date();
        await this.installmentPaymentService.save(installment);
      } else if (status === 'EXPIRED') {
        installment.status = 'rejected';
        await this.installmentPaymentService.save(installment);
      }
      return;
    }

    const payment = await this.paymentRepository.findOne({
      where: { no: externalId },
      relations: ['user', 'course', 'invoice', 'installment'],
    });
    if (!payment) return;

    if (payment.invoice && payment.invoice.paid_at) {
      if (payment.invoice.status !== 'paid') {
        payment.invoice.status = 'paid';
        await this.invoiceRepository.save(payment.invoice);
      }
      return;
    }

    if (status === 'PAID' || status === 'SETTLED') {
      payment.process = 'approved';
      if (payment.installment && !payment.dpPaidAt) {
        payment.dpPaidAt = new Date();
      }
      await this.paymentRepository.save(payment);

      if (payment.invoice) {
        payment.invoice.paid_at = new Date();
        payment.invoice.status = 'paid';
        if (payload.payment_method) {
          payment.invoice.payment_method = payload.payment_method;
        }
        if (payload.payment_channel) {
          payment.invoice.xendit_payment_channel = payload.payment_channel;
        }
        await this.invoiceRepository.save(payment.invoice);
      }

      const existing = await this.userCourseRepository.findOne({
        where: {
          user: { id: payment.user.id },
          course: { id: payment.course.id },
        },
      });
      if (!existing) {
        await this.paymentsService.addUserToCourse(
          payment.user.id,
          payment.course.id,
        );
      }
    } else if (status === 'EXPIRED') {
      payment.process = 'rejected';
      if (payment.invoice) {
        payment.invoice.status = 'expired';
        payment.invoice.expired_at = new Date();
        await this.invoiceRepository.save(payment.invoice);
      }
      await this.paymentRepository.save(payment);
    }
  }
}
