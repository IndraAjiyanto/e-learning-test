import { Module } from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { PembayaransController } from './pembayarans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas, User, Pembayaran])],
  controllers: [PembayaransController],
  providers: [PembayaransService],
  exports: [PembayaransService]
})
export class PembayaransModule {}
