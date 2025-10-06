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
import { JawabanTugas } from 'src/entities/jawaban_tugas.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserKelas, Mentor, Kelas, User, Pertemuan, Absen, Kategori, Minggu, ProgresMinggu, JenisKelas, Nilai, Quiz, JawabanTugas, ProgresPertemuan, Pembayaran]), PertanyaansModule, JawabanUsersModule, UsersModule],
  controllers: [KelassController],
  providers: [KelassService],
  exports: [KelassService],
})
export class KelassModule {}
