import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Payment } from 'src/entities/payment.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Registration } from 'src/entities/registration.entity';
import { Installment } from 'src/entities/installment.entity';
import { CommonModule } from 'src/common/common.module';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Session } from 'src/entities/session.entity';
import { VoucherModule } from 'src/voucher/voucher.module';
import { ApiPaymentController } from './api-payment.controller';
import { InvoiceModule } from 'src/invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Installment,
      Course,
      User,
      Payment,
      UserCourse,
      Registration,
      WeekProgress,
      SessionProgress,
      Weeks,
      Session,
    ]),
    CommonModule,
    VoucherModule,
    forwardRef(() => InvoiceModule),
  ],
  controllers: [PaymentsController, ApiPaymentController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
