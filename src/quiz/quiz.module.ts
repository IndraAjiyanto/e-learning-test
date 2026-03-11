import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { User } from 'src/entities/user.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { ProgresQuiz } from 'src/entities/progres_quiz.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { JawabanUser } from 'src/entities/jawaban_user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      Minggu,
      Nilai,
      User,
      Pertanyaan,
      ProgresQuiz,
      ProgresPertemuan,
      JawabanUser,
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
