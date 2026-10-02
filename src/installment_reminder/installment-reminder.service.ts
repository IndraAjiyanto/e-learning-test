import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Payment } from 'src/entities/payment.entity';
import { EmailService } from 'src/common/email/email.service';
import { InstallmentPaymentService } from 'src/installment_payment/installment-payment.service';
import { dateHelpers } from 'src/common/helpers';

@Injectable()
export class InstallmentReminderService {
  private readonly logger = new Logger(InstallmentReminderService.name);

  private readonly dateHelpers = dateHelpers;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly emailService: EmailService,
    private readonly installmentPaymentService: InstallmentPaymentService,
  ) {}

  @Cron('0 9 * * *')
  async sendMonthlyInstallmentReminders() {
    this.logger.log('Memulai pengecekan pengingat cicilan bulanan...');

    const payments = await this.paymentRepository.find({
      where: {
        installment: Not(IsNull()),
        process: 'approved',
        dpPaidAt: Not(IsNull()),
      },
      relations: ['user', 'course', 'installment'],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let remindersSent = 0;

    for (const payment of payments) {
      const schedule = payment.installment?.price || [];
      const dpDate = new Date(payment.dpPaidAt);
      dpDate.setHours(0, 0, 0, 0);

      const rows = await this.installmentPaymentService.findByPaymentId(
        payment.id,
      );
      const paidMonths = new Set(
        rows.filter((r) => r.status === 'approved').map((r) => r.month),
      );
      const sentMonths = new Set(payment.reminderSentMonths || []);

      for (let i = 0; i < schedule.length; i++) {
        const monthNumber = i + 1;

        if (paidMonths.has(monthNumber)) continue;
        if (sentMonths.has(monthNumber)) continue;

        const storedDate = payment.installment?.dueDates?.[monthNumber - 1];
        const dueDate = storedDate
          ? this.dateHelpers.toLocalDate(storedDate)
          : this.dateHelpers.getMonthlyDueDate(
              dpDate,
              monthNumber,
              dpDate.getDate(),
            );

        // Kirim reminder tepat pada hari jatuh tempo bulanan
        if (today.getTime() === dueDate.getTime()) {
          const amount = schedule[i] || 0;
          const email = payment.user?.email;
          const username = payment.user?.username || 'User';

          if (!email) continue;

          try {
            await this.emailService.sendInstallmentReminderEmail({
              to: email,
              username,
              courseName: payment.course?.name || 'Program',
              month: monthNumber,
              dueAmount: amount,
              dueDate,
              remainingInstallments: schedule.length - monthNumber,
            });

            const sent = new Set(payment.reminderSentMonths || []);
            sent.add(monthNumber);
            payment.reminderSentMonths = Array.from(sent);
            await this.paymentRepository.save(payment);
            remindersSent++;
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            this.logger.error(
              `Gagal mengirim email pengingat untuk payment ${payment.id} (bulan ${monthNumber}): ${message}`,
            );
          }
        }
      }
    }

    this.logger.log(
      `Selesai. Total email pengingat terkirim: ${remindersSent}`,
    );
  }
}
