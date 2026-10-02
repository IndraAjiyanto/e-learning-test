import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSettings } from 'src/entities/payment-settings.entity';
import { PaymentSettingsService } from './payment-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentSettings])],
  providers: [PaymentSettingsService],
  exports: [PaymentSettingsService],
})
export class PaymentSettingsModule {}