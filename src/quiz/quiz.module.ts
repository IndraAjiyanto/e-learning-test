import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { Minggu } from 'src/entities/minggu.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Quiz, Minggu])],
  controllers: [QuizController],
  providers: [QuizService],
    exports: [QuizService]
})
export class QuizModule {}
