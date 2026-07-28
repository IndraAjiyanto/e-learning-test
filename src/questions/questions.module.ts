import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { Session } from 'src/entities/session.entity';
import { Answer } from 'src/entities/answer.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { QuizModule } from 'src/quiz/quiz.module';
import { CommonModule } from 'src/common/common.module';
import { SessionsModule } from 'src/sessions/session.module';
import { AnswersModule } from 'src/answers/answers.module';
import { UserAnswersModule } from 'src/user_answers/user_answers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Session, Answer, Quiz]),
    SessionsModule,
    AnswersModule,
    UserAnswersModule,
    QuizModule,
    CommonModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
