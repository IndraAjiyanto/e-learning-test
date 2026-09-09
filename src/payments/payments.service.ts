import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import { InvoiceService } from 'src/invoice/invoice.service';
import { InstallmentPaymentService } from 'src/installment_payment/installment-payment.service';
import { InstallmentPayment } from 'src/entities/installment-payment.entity';
import { dateHelpers } from 'src/common/helpers';

@Injectable()
export class PaymentsService {
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
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly installmentPaymentService: InstallmentPaymentService,
  ) {}

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

  async addUserToCourse(userId: string, courseId: string) {
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
        const existingWeekProgress = await this.weekProgressRepository.findOne({
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

  async removeCourseUser(
    userId: string,
    courseId: string,
  ): Promise<UserCourse> {
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

  async checkPayment(userId: string, courseId: string) {
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

  async findCourse(courseId: string) {
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

  async findPayment(userId: string) {
    const payments = await this.paymentRepository.find({
      where: {
        user: { id: userId },
        installment: IsNull(),
      },
      relations: ['course', 'course.category', 'installment', 'invoice'],
    });

    return payments || [];
  }

  async findInstallments(userId: string) {
    return await this.paymentRepository.find({
      where: {
        user: { id: userId },
        installment: Not(IsNull()),
      },
      relations: ['course', 'course.category', 'installment', 'invoice'],
    });
  }

  // Reconcile pembayaran yang masih 'process' dengan status terbaru dari Xendit.
  // Menutup celah: user sudah bayar di Xendit tapi webhook/redireksi gagal tercatat.
  async reconcileUserPayments(userId: string) {
    // 1) Full payment & DP cicilan yang masih 'process' -> cek ke Xendit
    const stuckPayments = await this.paymentRepository.find({
      where: {
        user: { id: userId },
        process: 'process',
      },
      relations: ['invoice'],
    });
    for (const p of stuckPayments) {
      if (p.invoice?.xendit_invoice_id) {
        await this.invoiceService
          .settleStuckPayment(p.id)
          .catch(() => undefined);
      }
    }

    // 2) Parent cicilan (untuk lookup cicilan bulanan)
    const parents = await this.paymentRepository.find({
      where: {
        user: { id: userId },
        installment: Not(IsNull()),
      },
      relations: ['invoice'],
    });

    // 3) Cicilan bulanan yang masih 'process' -> cek ke Xendit
    const processRows = (
      await Promise.all(
        parents.map((p) => this.installmentPaymentService.findByPaymentId(p.id)),
      )
    ).flat();
    for (const row of processRows) {
      if (row.status !== 'process' || !row.xendit_invoice_id) continue;
      const res = await this.invoiceService.getXenditInvoiceStatus(
        row.xendit_invoice_id,
      );
      if (res && (res.status === 'PAID' || res.status === 'SETTLED')) {
        row.status = 'approved';
        row.paidAt = res.paidAt || new Date();
        await this.installmentPaymentService.save(row);
      } else if (res && res.status === 'EXPIRED') {
        row.status = 'rejected';
        await this.installmentPaymentService.save(row);
      }
    }
  }

  async getUserInstallmentDetail(userId: string) {
    // Cek & perbarui status pembayaran yang masih menggantung ke Xendit
    await this.reconcileUserPayments(userId).catch(() => undefined);

    const parents = await this.paymentRepository.find({
      where: {
        user: { id: userId },
        installment: Not(IsNull()),
      },
      relations: ['course', 'course.category', 'installment', 'invoice'],
      order: { createdAt: 'DESC' },
    });

    const installmentRows = await this.installmentPaymentService.findByPaymentIds(
      parents.map((p) => p.id),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return parents.map((p) => {
      const schedule = p.installment?.price || [];
      const dpAmount = p.installment?.downPayment || 0;
      const sumInstallments = schedule.reduce((a, b) => a + (b || 0), 0);
      const totalProgramFee =
        (p.installment?.downPayment || 0) + sumInstallments;

      const rows = installmentRows.filter((r) => r.payment?.id === p.id);
      const paidSet = new Set<number>(
        rows.filter((r) => r.status === 'approved').map((r) => r.month),
      );

      const monthlyStatus = schedule.map((amount, i) => {
        const month = i + 1;
        const dpDate = p.dpPaidAt ? new Date(p.dpPaidAt) : new Date();
        dpDate.setHours(0, 0, 0, 0);
        const storedDate = p.installment?.dueDates?.[month - 1];
        const dueDate = storedDate
          ? dateHelpers.toLocalDate(storedDate)
          : dateHelpers.getMonthlyDueDate(
              dpDate,
              month,
              dpDate.getDate(),
            );

        const tx = rows.find((r) => r.month === month);

        let status: 'paid' | 'process' | 'due' | 'upcoming' = 'upcoming';
        if (paidSet.has(month)) {
          status = 'paid';
        } else if (tx && tx.status === 'process') {
          status = 'process';
        } else if (today.getTime() >= dueDate.getTime()) {
          status = 'due';
        }

        return {
          month,
          amount,
          dueDate,
          status,
          txId: tx?.id || null,
          process: tx?.status || null,
        };
      });

      const paidMonths = Array.from(paidSet);
      const totalPaid = paidSet.size
        ? dpAmount + paidMonths.reduce((acc, m) => acc + (schedule[m - 1] || 0), 0)
        : dpAmount;

      return {
        id: p.id,
        course: p.course
          ? {
              id: p.course.id,
              name: p.course.name,
              category: p.course.category?.name || null,
              startDate: p.course.startDate,
              endDate: p.course.startEnd,
            }
          : null,
        installment: p.installment
          ? {
              id: p.installment.id,
              month: p.installment.month,
              downPayment: p.installment.downPayment,
              price: p.installment.price,
              dueDates: p.installment.dueDates,
            }
          : null,
        process: p.process,
        createdAt: p.createdAt,
        dpPaidAt: p.dpPaidAt,
        planMonth: p.installment?.month || 3,
        downPayment: dpAmount,
        totalProgramFee,
        paidSoFar: totalPaid,
        remainingBalance: totalProgramFee - totalPaid,
        progressPercentage:
          totalProgramFee > 0
            ? Math.round((totalPaid / totalProgramFee) * 100)
            : 0,
        monthly: monthlyStatus,
      };
    });
  }

  async findRegistration(userId: string) {
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
      relations: ['user', 'course', 'course.category', 'invoice'],
    });
  }

  async findAllInstallments() {
    return await this.paymentRepository.find({
      where: { installment: Not(IsNull()) },
      relations: [
        'user',
        'course',
        'course.category',
        'installment',
        'invoice',
      ],
    });
  }

  async findAllRegistrations() {
    return await this.registrationRepository.find({
      relations: ['user', 'course', 'course.category'],
    });
  }

  async findOne(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'course', 'invoice'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    } else {
      return payment;
    }
  }

  async update(paymentId: string, updatePaymentDto: UpdatePaymentDto) {
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

  async createXenditInvoice(
    userId: string,
    courseId: string,
    paymentMethod: string,
    promoCode?: string,
    formData?: any,
  ) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['installments'],
    });
    if (!course) throw new Error('Course not found');

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    let basePrice =
      course.promo && course.promo > 0 ? course.promo : course.price;
    let selectedInstallment: Installment | null = null;
    if (paymentMethod === 'Installment') {
      if (!course.installments || course.installments.length === 0) {
        throw new Error('Installment plan is not available for this course');
      }
      selectedInstallment = course.installments[0];
      basePrice = selectedInstallment.downPayment;

      // Cegah duplikasi: installment hanya boleh terhubung ke satu payment (OneToOne)
      const existingPayment = await this.paymentRepository.findOne({
        where: {
          user: { id: userId },
          course: { id: courseId },
          installment: { id: selectedInstallment.id },
        },
        relations: ['invoice'],
      });
      if (existingPayment) {
        if (existingPayment.process === 'approved') {
          return {
            process: 'approved',
            payment: existingPayment,
            invoice: existingPayment.invoice,
          } as any;
        }
        if (existingPayment.invoice) {
          return {
            process: 'process',
            payment: existingPayment,
            invoice: existingPayment.invoice,
          } as any;
        }
        throw new Error(
          'Anda sudah membuat pembayaran cicilan untuk program ini. Silakan lanjutkan pembayaran.',
        );
      }
    }

    let discountAmount = 0;
    let finalTotal = basePrice;
    let appliedVoucherCode: string | undefined = undefined;

    if (promoCode) {
      const validationResult = await this.voucherService.validateVoucher(
        promoCode,
        courseId,
        basePrice,
        userId,
      );
      discountAmount = validationResult.discountAmount;
      finalTotal = validationResult.finalTotal;
      appliedVoucherCode = promoCode;
    }

    const payment = this.paymentRepository.create({
      user: user,
      course: course,
      installment: selectedInstallment || undefined,
      process: finalTotal <= 0 ? 'approved' : 'process',
      no: `INV-${Date.now()}`,
      // Simpan data dari form
      user_fullname: formData?.user_fullname || null,
      user_email: formData?.user_email || null,
      user_no: formData?.user_no || formData?.no || null,
      current_status: formData?.current_status || null,
      referalSource: formData?.referal_source || null,
      attend_program: formData?.attend_program ? true : false,
    });

    await this.paymentRepository.save(payment);

    if (finalTotal <= 0) {
      await this.addUserToCourse(userId, courseId);
    }

    return this.invoiceService.createInvoiceForPayment(
      payment,
      finalTotal,
      user.email,
      course.name,
      paymentMethod,
      basePrice,
      discountAmount,
    );
  }

  // Get payment by No
  async getPaymentByNo(no: string) {
    return this.paymentRepository.findOne({
      where: { no },
      relations: ['course', 'user', 'invoice', 'installment'],
    });
  }

  // Get installment payment by No (table installment_payments)
  async getInstallmentPaymentByNo(no: string) {
    return this.installmentPaymentService.findByNo(no);
  }

  async updateInstallmentPayment(row: InstallmentPayment) {
    return this.installmentPaymentService.save(row);
  }

  async createMonthlyInstallmentInvoice(
    userId: string,
    parentPaymentId: string,
    month: number,
  ) {
    const parent = await this.paymentRepository.findOne({
      where: { id: parentPaymentId },
      relations: ['user', 'course', 'installment', 'installment.course'],
    });
    if (!parent || !parent.installment) {
      throw new Error('Rencana cicilan tidak ditemukan');
    }
    if (parent.process !== 'approved') {
      throw new Error('Pembayaran DP belum lunas/approved');
    }
    if (!parent.dpPaidAt) {
      throw new Error('Pembayaran DP belum tercatat');
    }
    if (parent.user && parent.user.id !== userId) {
      throw new Error('Payment tidak berhak diakses user ini');
    }

    const schedule = parent.installment.price || [];
    if (month < 1 || month > schedule.length) {
      throw new Error('Nomor cicilan tidak valid');
    }

    const existingRow =
      await this.installmentPaymentService.findOneByPaymentAndMonth(
        parentPaymentId,
        month,
      );
    if (existingRow && existingRow.status === 'approved') {
      throw new Error('Cicilan bulan ini sudah lunas');
    }

    // Sequential payment check: all previous months must be paid first
    if (month > 1) {
      const existingPayments =
        await this.installmentPaymentService.findByPaymentId(parentPaymentId);
      for (let m = 1; m < month; m++) {
        const prevPayment = existingPayments.find((p) => p.month === m);
        if (!prevPayment || prevPayment.status !== 'approved') {
          throw new Error(
            `Cicilan bulan ${m} belum lunas. Silakan bayar cicilan secara berurutan.`,
          );
        }
      }
    }

    const amount = schedule[month - 1];
    if (!amount && amount !== 0) {
      throw new Error('Nominal cicilan tidak ditemukan');
    }

    const course = parent.course;

    let row = existingRow;
    if (row) {
      // Cegah double-charge: jika invoice lama ternyata sudah dibayar di Xendit
      // (webhook mungkin gagal), tandai lunas tanpa membuat invoice baru.
      if (row.xendit_invoice_id) {
        const xenditStatus = await this.invoiceService.getXenditInvoiceStatus(
          row.xendit_invoice_id,
        );
        if (
          xenditStatus &&
          (xenditStatus.status === 'PAID' ||
            xenditStatus.status === 'SETTLED')
        ) {
          row.status = 'approved';
          row.paidAt = xenditStatus.paidAt || new Date();
          return await this.installmentPaymentService.save(row);
        }
      }

      // Belum dibayar -> regenerasi invoice baru agar user bisa membayar lagi.
      row.amount = amount;
      row.no = `INV-M${month}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      row.xendit_invoice_id = '';
      row.xendit_invoice_url = '';
      row.status = 'process';
    } else {
      row = await this.installmentPaymentService.create({
        payment: parent,
        month,
        amount,
        status: 'process',
        no: `INV-M${month}-${Date.now()}`,
      });
    }

    return this.invoiceService.createInvoiceForInstallment(
      row,
      amount,
      parent.user?.email || 'guest@example.com',
      course?.name || 'Program',
    );
  }

  // Get course by ID
  async findCourseById(courseId: string) {
    return this.courseRepository.findOneBy({ id: courseId });
  }
}
