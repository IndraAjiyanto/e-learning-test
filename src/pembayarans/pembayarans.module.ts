import { Module } from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { PembayaransController } from './pembayarans.controller';

@Module({
  controllers: [PembayaransController],
  providers: [PembayaransService],
})
export class PembayaransModule {}
