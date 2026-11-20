import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Registration } from 'src/entities/registration.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Payment } from 'src/entities/payment.entity';
import { CommonModule } from 'src/common/common.module';
import { InvoiceModule } from 'src/invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, Registration, UserCourse, Payment]),
    CommonModule,
    InvoiceModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
