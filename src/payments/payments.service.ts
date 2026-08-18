import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Registration } from 'src/entities/registration.entity';
import { Installment } from 'src/entities/installment.entity';
import { Session } from 'src/entities/session.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { VoucherService } from 'src/voucher/voucher.service';
import { Voucher } from 'src/entities/voucher.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import Xendit from 'xendit-node';

@Injectable()
export class PaymentsService {
  private xenditClient: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Installment)
    private readonly installmentsRepository: Repository<Installment>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(WeekProgress)
    private readonly weekProgressRepository: Repository<WeekProgress>,
    @InjectRepository(SessionProgress)
    private readonly sessionProgressRepository: Repository<SessionProgress>,
    @InjectRepository(Weeks)
    private readonly weeksRepository: Repository<Weeks>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly voucherService: VoucherService,
  ) {
    if (process.env.XENDIT_SECRET_KEY) {
      this.xenditClient = new Xendit({
        secretKey: process.env.XENDIT_SECRET_KEY,
      });
    }
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPaymentDto.userId },
    });
    if (!user) {
      return;
    }

    const course = await this.courseRepository.findOne({
      where: { id: createPaymentDto.courseId },
    });
    if (!course) {
      return;
    }

    if (createPaymentDto.installmentId) {
      const installments = await this.installmentsRepository.findOne({
        where: { id: createPaymentDto.installmentId },
      });
      if (!installments) {
        return;
      }
      const check = await this.checkPayment(
        createPaymentDto.userId,
        createPaymentDto.courseId,
      );
      if (check == false) {
        return false;
      } else {
        const payment = await this.paymentRepository.create({
          ...createPaymentDto,
          user: user,
          course: course,
          installment: installments,
        });
        return await this.paymentRepository.save(payment);
      }
    }

    const check = await this.checkPayment(
      createPaymentDto.userId,
      createPaymentDto.courseId,
    );
    if (check == false) {
      return false;
    } else {
      const payment = await this.paymentRepository.create({
        ...createPaymentDto,
        user: user,
        course: course,
      });
      return await this.paymentRepository.save(payment);
    }
  }

  async addUserToCourse(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'weeks.session'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const alreadyJoined = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (alreadyJoined) {
      throw new BadRequestException('User already joined the program');
    }

    const userCourses = await this.userCourseRepository.create({
      progress: false,
      user: user,
      course: course,
    });

    await this.userCourseRepository.save(userCourses);

    if (course.weeks.length > 0) {
      const weeks = await this.weeksRepository.findOne({
        where: { course: { id: courseId }, weekNumber: 1 },
        relations: ['session'],
      });
      const lastWeek = await this.weeksRepository.findOne({
        where: { course: { id: courseId }, isFinal: true },
      });
      if (weeks) {
        const existingWeekProgress =
          await this.weekProgressRepository.findOne({
            where: {
              week: { id: weeks.id },
              user: { id: userId },
            },
          });
        if (existingWeekProgress) {
          await this.weekProgressRepository.save({
            id: existingWeekProgress.id,
            weeks: weeks,
            user: user,
            proses: true,
            quiz: false,
          });
        } else {
          await this.weekProgressRepository.save({
            weeks: weeks,
            user: user,
            proses: true,
            quiz: false,
          });
        }

        const session = await this.sessionRepository.findOne({
          where: { weeks: { id: weeks.id }, sessionOrder: 1 },
          relations: [],
        });
        if (session) {
          const existingSessionProgress =
            await this.sessionProgressRepository.findOne({
              where: { session: { id: session.id }, user: { id: userId } },
            });
          if (existingSessionProgress) {
            await this.sessionProgressRepository.save({
              id: existingSessionProgress.id,
              session: session,
              user: user,
                isAttended: true,
              logbook: false,
            });
          } else {
            await this.sessionProgressRepository.save({
              session: session,
              user: user,
                isAttended: true,
              logbook: false,
            });
          }
        }
      } else if (lastWeek) {
        const lastWeekProgress = await this.weekProgressRepository.findOne({
          where: {
            week: { id: lastWeek.id },
            user: { id: userId },
            process: true,
            quiz: true,
          },
        });
        if (lastWeekProgress) {
          await this.userCourseRepository.update(userCourses.id, {
            progress: true,
          });
        }
      }
    }
  }

  async removeCourseUser(userId: number, courseId: number): Promise<UserCourse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const userCourse = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userCourse) {
      throw new BadRequestException('User is not enrolled in this program');
    }

    return await this.userCourseRepository.remove(userCourse);
  }

  async checkPayment(userId: number, courseId: number) {
    const payment = await this.paymentRepository.find({
      where: {
        user: { id: userId },
        course: { id: courseId },
        process: Not('rejected'),
      },
    });
    if (payment.length) {
      return false;
    } else {
      return true;
    }
  }

  async findCourse(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'category', 'installments'],
    });
    if (!course) {
      return;
    } else {
      return course;
    }
  }

  async findPayment(userId: number) {
    const payments = await this.paymentRepository.find({
      where: {
        user: { id: userId },
        installment: IsNull(),
      },
      relations: ['course', 'course.category', 'installment'],
    });

    return payments || [];
  }

  async findInstallments(userId: number) {
    return await this.paymentRepository.find({
      where: {
        user: { id: userId },
        installment: Not(IsNull()),
      },
      relations: ['course', 'course.category', 'installment'],
    });
  }

  async findRegistration(userId: number) {
    console.log('🔵 [PaymentsService] findRegistration for userId:', userId);
    const result = await this.registrationRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.category'],
    });
    console.log('🔵 [PaymentsService] findRegistration result:', result);
    return result;
  }

  async findAll() {
    return await this.paymentRepository.find({
      where: { installment: IsNull() },
      relations: ['user', 'course', 'course.category'],
    });
  }

  async findAllInstallments() {
    return await this.paymentRepository.find({
      where: { installment: Not(IsNull()) },
      relations: ['user', 'course', 'course.category', 'installment'],
    });
  }

  async findAllRegistrations() {
    return await this.registrationRepository.find({
      relations: ['user', 'course', 'course.category'],
    });
  }

  async findOne(paymentId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'course'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    } else {
      return payment;
    }
  }

  async update(paymentId: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(paymentId);
    if (!payment) {
      return;
    }
    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async createXenditInvoice(userId: number, courseId: number, paymentMethod: string, promoCode?: string) {
    if (!this.xenditClient) {
      throw new Error('Xendit is not configured. Please add XENDIT_SECRET_KEY to .env');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['installments'],
    });
    if (!course) throw new Error('Course not found');

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    let basePrice = course.promo && course.promo > 0 ? course.promo : course.price;
    if (paymentMethod === 'Installment') {
      if (!course.installments || course.installments.length === 0) {
        throw new Error('Installment plan is not available for this course');
      }
      basePrice = course.installments[0].downPayment;
    }

    let discountAmount = 0;
    let finalTotal = basePrice;
    let appliedVoucherCode: string | undefined = undefined;

    if (promoCode) {
       const validationResult = await this.voucherService.validateVoucher(promoCode, courseId, basePrice, userId);
       discountAmount = validationResult.discountAmount;
       finalTotal = validationResult.finalTotal;
       appliedVoucherCode = promoCode; 
    }

    const payment = this.paymentRepository.create({
      user: user,
      course: course,
      subtotal: basePrice,
      discount_amount: discountAmount,
      final_total: finalTotal,
      voucherCode: appliedVoucherCode,
      userName: user.username,
      userEmail: user.email, 
      courseName: course.name, 
      payment_method: paymentMethod,
      payment_status: finalTotal <= 0 ? 'paid' : 'pending_payment',
      process: finalTotal <= 0 ? 'approved' : 'process', 
      no: `INV-${Date.now()}`
    });
    
    await this.paymentRepository.save(payment);

    if (finalTotal <= 0) {
      payment.paid_at = new Date();
      await this.paymentRepository.save(payment);
      await this.addUserToCourse(userId, courseId);
      return payment;
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    try {
      const invoice = await this.xenditClient.Invoice.createInvoice({
        data: {
          externalId: payment.uuid, 
          amount: finalTotal,
          payerEmail: user.email || 'guest@example.com',
          description: `Payment for ${course.name} - ${paymentMethod}`,
          successRedirectUrl: `${appUrl}/payment/success/${payment.uuid}`,
          failureRedirectUrl: `${appUrl}/payment/failed/${payment.uuid}`,
        },
      });

      payment.xendit_invoice_id = invoice.id;
      payment.xendit_invoice_url = invoice.invoiceUrl;
      await this.paymentRepository.save(payment);

      return payment;
    } catch (error) {
      payment.payment_status = 'failed';
      payment.process = 'rejected';
      await this.paymentRepository.save(payment);
      throw new Error('Gagal terhubung dengan Xendit Payment Gateway');
    }
  }

  // Get payment by UUID
  async getPaymentByUuid(uuid: string) {
    return this.paymentRepository.findOne({
      where: { uuid },
      relations: ['course', 'user']
    });
  }

  // Get course by ID
  async findCourseById(courseId: number) {
    return this.courseRepository.findOneBy({ id: courseId });
  }

  // Simulate webhook for localhost testing
  async simulatePaymentSuccess(uuid: string) {
    const payment = await this.paymentRepository.findOne({ 
       where: { uuid },
       relations: ['user', 'course'] 
    });
    if (!payment) throw new Error('Payment tidak ditemukan');
    if (payment.payment_status === 'paid') {
      return payment; 
    }

    payment.payment_status = 'paid';
    payment.process = 'approved';
    payment.paid_at = new Date();
    await this.paymentRepository.save(payment);

    try {
      await this.addUserToCourse(payment.user.id, payment.course.id);
    } catch (err) {
      console.error('Error auto-enrolling user after simulated payment:', err);
    }

    return payment;
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
       where: { uuid: externalId },
       relations: ['user', 'course'] 
    });
    if (!payment) return;

    if (payment.payment_status === 'paid' || payment.payment_status === 'expired') {
       return; 
    }

    if (status === 'PAID' || status === 'SETTLED') {
      payment.payment_status = 'paid';
      payment.process = 'approved'; 
      payment.paid_at = new Date();
      if (payload.payment_method) {
        payment.payment_method = payload.payment_method;
      }
      
      await this.paymentRepository.save(payment);
      await this.addUserToCourse(payment.user.id, payment.course.id);
    } 
    else if (status === 'EXPIRED') {
      payment.payment_status = 'expired';
      payment.process = 'rejected';
      await this.paymentRepository.save(payment);
    }
  }
}
