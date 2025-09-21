import { Module } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { KelassController } from './kelass.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Absen } from 'src/entities/absen.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { PertanyaansModule } from 'src/pertanyaans/pertanyaans.module';
import { JawabanUsersModule } from 'src/jawaban_users/jawaban_users.module';
import { UsersModule } from 'src/users/users.module';
import { Minggu } from 'src/entities/minggu.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { Quiz } from 'src/entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas, User, Pertemuan, Absen, Kategori, Minggu, ProgresMinggu, JenisKelas, Nilai, Quiz]), PertanyaansModule, JawabanUsersModule, UsersModule],
  controllers: [KelassController],
  providers: [KelassService],
  exports: [KelassService],
})
export class KelassModule {}
