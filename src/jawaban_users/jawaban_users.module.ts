import { Module } from '@nestjs/common';
import { JawabanUsersService } from './jawaban_users.service';
import { JawabanUsersController } from './jawaban_users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { User } from 'src/entities/user.entity';
import { JawabanUser } from 'src/entities/jawaban_user.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { Minggu } from 'src/entities/minggu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pertanyaan, Jawaban, User, JawabanUser, Nilai, Quiz, ProgresMinggu, Minggu])],
  controllers: [JawabanUsersController],
  providers: [JawabanUsersService],
  exports: [JawabanUsersService]
})
export class JawabanUsersModule {}
