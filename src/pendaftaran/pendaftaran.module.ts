import { Module } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { PendaftaranController } from './pendaftaran.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kelas, User, Pendaftaran, UserKelas])],
  controllers: [PendaftaranController],
  providers: [PendaftaranService],
})
export class PendaftaranModule {}
