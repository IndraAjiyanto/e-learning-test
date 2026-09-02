import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice.entity';
import { Payment } from 'src/entities/payment.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { ConfigModule } from '@nestjs/config';
import { VoucherModule } from 'src/voucher/voucher.module';
import { Course } from 'src/entities/course.entity';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Payment, UserCourse, Course]),
    ConfigModule,
    VoucherModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
