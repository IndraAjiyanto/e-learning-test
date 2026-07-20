import { Module } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { InstallmentsController } from './installments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installment } from '../entities/installment.entity';
import { Course } from '../entities/course.entity';
import { Payment } from 'src/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Installment, Course, Payment])],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
