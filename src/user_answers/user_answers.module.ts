import { Module } from '@nestjs/common';
import { UserAnswersService } from './user_answers.service';
import { UserAnswersController } from './user_answers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { User } from 'src/entities/user.entity';
import { UserAnswer } from 'src/entities/user_answer.entity';
import { Score } from 'src/entities/score.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Session } from 'src/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      Answer,
      User,
      UserAnswer,
      Score,
      Quiz,
      WeekProgress,
      Weeks,
      UserCourse,
      SessionProgress,
      Session,
    ]),
  ],
  controllers: [UserAnswersController],
  providers: [UserAnswersService],
  exports: [UserAnswersService],
})
export class UserAnswersModule {}
