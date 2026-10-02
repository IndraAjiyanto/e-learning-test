import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { ApiVoucherController } from './api-voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from 'src/entities/voucher.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';

@Module({
  // Daftarkan Voucher, Course, dan User agar repository-nya bisa di-inject di service
  imports: [TypeOrmModule.forFeature([Voucher, Course, User])],
  controllers: [VoucherController, ApiVoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
