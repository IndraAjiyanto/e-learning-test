import { Module } from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { PembayaransController } from './pembayarans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { Cicilan } from 'src/entities/cicilan.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cicilan, Kelas, User, Pembayaran, UserKelas, Pendaftaran]), CommonModule],
  controllers: [PembayaransController],
  providers: [PembayaransService],
  exports: [PembayaransService]
})
export class PembayaransModule {}
