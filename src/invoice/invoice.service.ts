import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payment.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import Xendit from 'xendit-node';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class InvoiceService {
  private xenditClient: any;

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {
    if (process.env.XENDIT_SECRET_KEY) {
      this.xenditClient = new Xendit({
        secretKey: process.env.XENDIT_SECRET_KEY,
      });
    }
  }

  async createInvoiceForPayment(payment: Payment, finalTotal: number, payerEmail: string, courseName: string, paymentMethod: string, subtotal: number, discountAmount: number) {
    if (!this.xenditClient) {
      throw new Error('Xendit is not configured. Please add XENDIT_SECRET_KEY to .env');
    }

    const invoice = this.invoiceRepository.create({
      payment: payment,
      subtotal: subtotal,
      discount_amount: discountAmount,
      final_total: finalTotal,
      payment_method: paymentMethod
    });
    
    await this.invoiceRepository.save(invoice);

    if (finalTotal <= 0) {
      invoice.paid_at = new Date();
      await this.invoiceRepository.save(invoice);
      
      payment.invoice = invoice;
      return payment;
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    try {
      const xenditResponse = await this.xenditClient.Invoice.createInvoice({
        data: {
          externalId: payment.no,
          amount: finalTotal,
          payerEmail: payerEmail || 'guest@example.com',
          description: `Payment for ${courseName} - ${paymentMethod}`,
          successRedirectUrl: `${appUrl}/payment/success/${payment.no}`,
          failureRedirectUrl: `${appUrl}/payment/failed/${payment.no}`,
        },
      });

      invoice.xendit_invoice_id = xenditResponse.id;
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

  async simulatePaymentSuccess(no: string) {
    const payment = await this.paymentRepository.findOne({ 
       where: { no },
       relations: ['user', 'course', 'invoice'] 
    });
    if (!payment) throw new Error('Payment tidak ditemukan');
    
    if (payment.invoice && payment.invoice.paid_at) {
      return payment; 
    }

    if (payment.invoice) {
        payment.invoice.paid_at = new Date();
        await this.invoiceRepository.save(payment.invoice);
    }

    payment.process = 'approved';
    await this.paymentRepository.save(payment);

    try {
        const existing = await this.userCourseRepository.findOne({
            where: { user: { id: payment.user.id }, course: { id: payment.course.id } }
        });
        if (!existing) {
            const newUserCourse = this.userCourseRepository.create({
                user: { id: payment.user.id },
                course: { id: payment.course.id },
                progress: false
            });
            await this.userCourseRepository.save(newUserCourse);
        }
    } catch (err) {
      console.error('Error auto-enrolling user after simulated payment:', err);
    }

    return payment;
  }

  async findCourseById(courseId: number) {
    return this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'category', 'installments'],
    });
  }

  async handleXenditWebhook(payload: any, callbackToken: string) {
    const validToken = process.env.XENDIT_CALLBACK_TOKEN; 
    
    if (validToken && callbackToken !== validToken) {
      throw new Error('Unauthorized: Token Webhook Tidak Valid!'); 
    }

    const externalId = payload.external_id; 
    const status = payload.status; 

    if (!externalId) return;

    const payment = await this.paymentRepository.findOne({
       where: { no: externalId },
       relations: ['user', 'course', 'invoice'] 
    });
    if (!payment) return;

    if (payment.invoice && payment.invoice.paid_at) {
       return; 
    }

    if (status === 'PAID' || status === 'SETTLED') {
      payment.process = 'approved'; 
      await this.paymentRepository.save(payment);

      if (payment.invoice) {
          payment.invoice.paid_at = new Date();
          if (payload.payment_method) {
              payment.invoice.payment_method = payload.payment_method;
          }
          await this.invoiceRepository.save(payment.invoice);
      }
      
      const existing = await this.userCourseRepository.findOne({
          where: { user: { id: payment.user.id }, course: { id: payment.course.id } }
      });
      if (!existing) {
          const newUserCourse = this.userCourseRepository.create({
              user: { id: payment.user.id },
              course: { id: payment.course.id },
              progress: false
          });
          await this.userCourseRepository.save(newUserCourse);
      }

    } 
    else if (status === 'EXPIRED') {
      payment.process = 'rejected';
      await this.paymentRepository.save(payment);
    }
  }
}
