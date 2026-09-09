import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentPayment } from 'src/entities/installment-payment.entity';
import { InstallmentPaymentService } from './installment-payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstallmentPayment])],
  providers: [InstallmentPaymentService],
  exports: [InstallmentPaymentService],
})
export class InstallmentPaymentModule {}
