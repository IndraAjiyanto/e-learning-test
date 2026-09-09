import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Installment } from 'src/entities/installment.entity';
import { EmailService } from 'src/common/email/email.service';
import { InstallmentReminderService } from './installment-reminder.service';
import { InstallmentPaymentModule } from 'src/installment_payment/installment-payment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Payment, User, Course, Installment]),
    InstallmentPaymentModule,
  ],
  providers: [InstallmentReminderService, EmailService],
  exports: [InstallmentReminderService],
})
export class InstallmentReminderModule {}
