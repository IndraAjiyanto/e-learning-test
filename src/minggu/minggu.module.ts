import { Module } from '@nestjs/common';
import { MingguService } from './minggu.service';
import { MingguController } from './minggu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Minggu } from 'src/entities/minggu.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Minggu, Kelas, User, Pertemuan, ProgresMinggu, UserKelas])],
  controllers: [MingguController],
  providers: [MingguService],
  exports: [MingguService],
})
export class MingguModule {}
