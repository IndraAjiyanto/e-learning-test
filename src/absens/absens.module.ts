import { Module } from '@nestjs/common';
import { AbsensService } from './absens.service';
import { AbsensController } from './absens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absen } from 'src/entities/absen.entity';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absen, User, Pertemuan])],
  controllers: [AbsensController],
  providers: [AbsensService],
  exports: [AbsensService],
})
export class AbsensModule {}
