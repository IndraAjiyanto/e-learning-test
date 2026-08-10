import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from 'src/entities/voucher.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  // Daftarkan Voucher dan Course agar repository-nya bisa di-inject di service
  imports: [TypeOrmModule.forFeature([Voucher, Course])],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
