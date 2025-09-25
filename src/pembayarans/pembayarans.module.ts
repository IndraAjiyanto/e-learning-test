import { Module } from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { PembayaransController } from './pembayarans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas, User, Pembayaran, UserKelas])],
  controllers: [PembayaransController],
  providers: [PembayaransService],
  exports: [PembayaransService]
})
export class PembayaransModule {}
